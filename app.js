const $=id=>document.getElementById(id);
let stops=JSON.parse(localStorage.getItem("myroute_stops")||"[]");
let saved=JSON.parse(localStorage.getItem("myroute_saved")||"[]");
let start=JSON.parse(localStorage.getItem("myroute_start")||"null");
const persist=()=>{localStorage.setItem("myroute_stops",JSON.stringify(stops));render()};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function render(){
 const done=stops.filter(s=>s.done).length;
 $("totalCount").textContent=stops.length;$("doneCount").textContent=done;$("remainingCount").textContent=stops.length-done;
 $("startStatus").textContent=start?.label||"Your current location has not been set.";
 const q=$("filterInput").value.toLowerCase();
 const visible=stops.map((s,i)=>({...s,i})).filter(s=>s.address.toLowerCase().includes(q));
 $("stopList").innerHTML=visible.map(s=>`<li class="${s.done?'done':''}"><div class="stopline"><input type="checkbox" data-done="${s.id}" ${s.done?'checked':''} aria-label="Mark completed"><span class="address">${esc(s.address)}</span><span class="stop-actions"><button class="secondary" data-nav="${s.id}">Go</button><button class="secondary" data-del="${s.id}">×</button></span></div></li>`).join("");
 $("emptyState").hidden=stops.length>0;
 $("savedRoutes").innerHTML=saved.length?saved.map((r,i)=>`<li>${esc(r.date)} · ${r.count} stops <button class="secondary small" data-load="${i}">Restore</button></li>`).join(""):"<li>No saved routes yet.</li>";
}
function addAddresses(lines){let added=0;for(const raw of lines){const address=raw.trim().replace(/^["']|["']$/g,"");if(address&& !stops.some(s=>s.address.toLowerCase()===address.toLowerCase())){stops.push({id:crypto.randomUUID(),address,done:false});added++}}persist();$("importStatus").textContent=`Added ${added} new address(es). ${stops.length} total stops.`}
$("addBulkBtn").onclick=()=>{addAddresses($("bulkAddresses").value.split(/\r?\n/));$("bulkAddresses").value=""};
$("filterInput").oninput=render;
$("stopList").onclick=e=>{const t=e.target;if(t.dataset.nav){const s=stops.find(x=>x.id===t.dataset.nav);if(s)navigate(s.address)}if(t.dataset.del){stops=stops.filter(x=>x.id!==t.dataset.del);persist()}};
$("stopList").onchange=e=>{if(e.target.dataset.done){const s=stops.find(x=>x.id===e.target.dataset.done);if(s)s.done=e.target.checked;persist()}};
function navigate(address){const url="https://www.google.com/maps/dir/?api=1&destination="+encodeURIComponent(address)+"&travelmode=driving";window.open(url,"_blank","noopener");}
$("navigateBtn").onclick=()=>{const next=stops.find(s=>!s.done);if(!next){$("routeStatus").textContent="All deliveries are completed.";return}navigate(next.address)};
$("saveStartBtn").onclick=()=>{const v=$("startAddress").value.trim();if(!v)return;start={label:v};localStorage.setItem("myroute_start",JSON.stringify(start));render()};
$("locateBtn").onclick=()=>{if(!navigator.geolocation){$("startStatus").textContent="Location is not available in this browser.";return}$("startStatus").textContent="Requesting location permission…";navigator.geolocation.getCurrentPosition(p=>{start={label:`Current location (${p.coords.latitude.toFixed(5)}, ${p.coords.longitude.toFixed(5)})`,lat:p.coords.latitude,lng:p.coords.longitude};localStorage.setItem("myroute_start",JSON.stringify(start));render()},err=>{$("startStatus").textContent="Could not get location. Allow location access or enter a start address."},{enableHighAccuracy:true,timeout:12000})};
$("clearDoneBtn").onclick=()=>{stops=stops.filter(s=>!s.done);persist()};
$("saveRouteBtn").onclick=()=>{if(!stops.length){$("routeStatus").textContent="Add stops before saving a route.";return}saved.unshift({date:new Date().toLocaleString(),count:stops.length,stops:JSON.parse(JSON.stringify(stops)),start});localStorage.setItem("myroute_saved",JSON.stringify(saved));$("routeStatus").textContent="Route saved on this device.";render()};
$("savedRoutes").onclick=e=>{if(e.target.dataset.load!==undefined){const r=saved[Number(e.target.dataset.load)];if(r){stops=JSON.parse(JSON.stringify(r.stops));start=r.start||null;localStorage.setItem("myroute_start",JSON.stringify(start));persist();$("routeStatus").textContent="Saved route restored."}}};
$("csvFile").onchange=async e=>{const f=e.target.files[0];if(!f)return;const txt=await f.text();const rows=txt.split(/\r?\n/).filter(Boolean);if(!rows.length)return;const first=rows[0].split(",").map(x=>x.trim().toLowerCase().replace(/^"|"$/g,""));let idx=first.findIndex(x=>["address","delivery address","stop","location"].includes(x));if(idx<0)idx=0;const data=first.some(x=>["address","delivery address","stop","location"].includes(x))?rows.slice(1):rows;addAddresses(data.map(line=>{const cols=line.match(/("(?:[^"]|"")*"|[^,]*)(,|$)/g)||[line];return (cols[idx]||line).replace(/,$/,"").trim().replace(/^"|"$/g,"").replace(/""/g,'"')}));e.target.value=""};
$("exportBtn").onclick=()=>{const csv="Address,Completed\n"+stops.map(s=>`"${s.address.replace(/"/g,'""')}",${s.done}`).join("\n");const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));a.download="my-route-stops.csv";a.click();URL.revokeObjectURL(a.href)};
if("serviceWorker"in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
render();

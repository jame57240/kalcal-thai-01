const $ = (id) => document.getElementById(id);
const STORAGE_KEY = "kalcal-thai-v1";
const foods = [
  {id:"rice",name:"ข้าวสวย",kcal:130,protein:2.7,carbs:28,fat:.3,serving:"100 กรัม",emoji:"🍚"},
  {id:"egg",name:"ไข่ไก่ต้ม",kcal:78,protein:6.3,carbs:.6,fat:5.3,serving:"1 ฟอง",emoji:"🥚"},
  {id:"chicken",name:"อกไก่สุก",kcal:165,protein:31,carbs:0,fat:3.6,serving:"100 กรัม",emoji:"🍗"},
  {id:"kaprao",name:"ข้าวกะเพราไก่",kcal:580,protein:28,carbs:72,fat:18,serving:"1 จานโดยประมาณ",emoji:"🍛"},
  {id:"chickenrice",name:"ข้าวมันไก่",kcal:600,protein:25,carbs:75,fat:22,serving:"1 จานโดยประมาณ",emoji:"🍗"},
  {id:"somtam",name:"ส้มตำไทย",kcal:120,protein:3,carbs:24,fat:2,serving:"1 จานโดยประมาณ",emoji:"🥗"},
  {id:"milk",name:"นมจืด",kcal:125,protein:8,carbs:12,fat:5,serving:"250 มล.",emoji:"🥛"},
  {id:"whey",name:"เวย์โปรตีน",kcal:120,protein:24,carbs:3,fat:2,serving:"1 สกู๊ปโดยประมาณ",emoji:"🥤"},
  {id:"banana",name:"กล้วยหอม",kcal:105,protein:1.3,carbs:27,fat:.4,serving:"1 ผลกลาง",emoji:"🍌"},
  {id:"salmon",name:"ปลาแซลมอนสุก",kcal:206,protein:22,carbs:0,fat:12,serving:"100 กรัม",emoji:"🐟"},
  {id:"tofu",name:"เต้าหู้ขาว",kcal:76,protein:8,carbs:2,fat:4.8,serving:"100 กรัม",emoji:"◻️"},
  {id:"yogurt",name:"กรีกโยเกิร์ตรสธรรมชาติ",kcal:100,protein:10,carbs:4,fat:4,serving:"100 กรัม",emoji:"🥣"},
  {id:"tuna",name:"ทูน่าในน้ำแร่",kcal:116,protein:26,carbs:0,fat:1,serving:"100 กรัม",emoji:"🐟"},
  {id:"oats",name:"ข้าวโอ๊ตแห้ง",kcal:389,protein:16.9,carbs:66.3,fat:6.9,serving:"100 กรัม",emoji:"🥣"},
  {id:"pork",name:"หมูสันในสุก",kcal:143,protein:26,carbs:0,fat:3.5,serving:"100 กรัม",emoji:"🍖"}
];
const todayKey = () => new Date().toLocaleDateString("en-CA");
let state = loadState();
let scannerStream = null;
let barcodeDetector = null;
let scanLoop = null;
let deferredInstallPrompt = null;
let photoDataUrl = null;

function loadState(){
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    const today = todayKey();
    return {
      date: today,
      logs: saved.date === today && Array.isArray(saved.logs) ? saved.logs : [],
      goals: saved.goals || {kcal:2000,protein:130,name:"",weight:""}
    };
  } catch { return {date:todayKey(),logs:[],goals:{kcal:2000,protein:130,name:"",weight:""}}; }
}
function saveState(){ state.date=todayKey(); localStorage.setItem(STORAGE_KEY,JSON.stringify(state)); }
function num(n){ return Math.round(Number(n)||0).toLocaleString("th-TH"); }
function toast(message){ const el=$("toast"); el.textContent=message;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),2200); }
function escapeHtml(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function addFood(food){
  state.logs.push({...food,logId:crypto.randomUUID?crypto.randomUUID():String(Date.now()+Math.random())});
  saveState();render();showTab("today");toast(`เพิ่ม ${food.name} แล้ว`);
}
function totals(){return state.logs.reduce((a,f)=>({kcal:a.kcal+Number(f.kcal||0),protein:a.protein+Number(f.protein||0),carbs:a.carbs+Number(f.carbs||0),fat:a.fat+Number(f.fat||0)}),{kcal:0,protein:0,carbs:0,fat:0});}
function render(){
  const t=totals(),g=state.goals;
  $("todayDate").textContent=new Date().toLocaleDateString("th-TH",{day:"numeric",month:"short"});
  $("totalKcal").textContent=num(t.kcal);$("goalKcalLabel").textContent=num(g.kcal);$("remainingKcal").textContent=`${num(Math.max(0,g.kcal-t.kcal))} kcal`;
  $("kcalProgress").style.width=`${Math.min(100,t.kcal/Math.max(1,g.kcal)*100)}%`;
  $("proteinText").textContent=`${num(t.protein)} / ${num(g.protein)} g`;
  $("proteinProgress").style.width=`${Math.min(100,t.protein/Math.max(1,g.protein)*100)}%`;
  $("carbsText").textContent=`${num(t.carbs)} g`;$("fatText").textContent=`${num(t.fat)} g`;
  $("logCount").textContent=`${state.logs.length} รายการ`;
  $("foodLog").innerHTML=state.logs.length?state.logs.map(f=>`<div class="food-item"><div class="food-emoji">${escapeHtml(f.emoji||"🍽️")}</div><div class="food-info"><div class="food-name">${escapeHtml(f.name)}</div><div class="food-meta">โปรตีน ${num(f.protein)} g · ${escapeHtml(f.serving||"ปริมาณที่บันทึก")}</div></div><div><div class="food-kcal">${num(f.kcal)} kcal</div><button class="delete" data-remove="${escapeHtml(f.logId)}">ลบ</button></div></div>`).join(""):`<div class="empty-state"><div class="emoji">🍱</div><strong>ยังไม่มีรายการอาหาร</strong><span>เพิ่มอาหารมื้อแรกของวันนี้ได้เลย</span><br><button class="primary" data-goto-food style="margin-top:13px">＋ เพิ่มอาหาร</button></div>`;
  renderFoodResults($("foodSearch").value||"");
  $("goalKcal").value=g.kcal;$("goalProtein").value=g.protein;$("displayName").value=g.name||"";$("weight").value=g.weight||"";
}
function renderFoodResults(q=""){
 const list=foods.filter(f=>f.name.toLowerCase().includes(q.trim().toLowerCase()));
 $("foodResults").innerHTML=list.length?list.map(f=>`<button class="food-item result-button" data-food="${f.id}" style="text-align:left;width:100%"><div class="food-emoji">${f.emoji}</div><div class="food-info"><div class="food-name">${escapeHtml(f.name)}</div><div class="food-meta">${escapeHtml(f.serving)} · โปรตีน ${f.protein} g</div></div><div><div class="food-kcal">${f.kcal} kcal</div><div class="food-meta" style="color:var(--orange);text-align:right">＋ เพิ่ม</div></div></button>`).join(""):`<div class="empty-state">ไม่พบอาหาร ลองค้นหาคำอื่นหรือเพิ่มอาหารเอง</div>`;
}
function showTab(tab){
 document.querySelectorAll(".page").forEach(p=>p.classList.toggle("active",p.id===tab));
 document.querySelectorAll(".tab").forEach(b=>b.classList.toggle("active",b.dataset.tab===tab));
 window.scrollTo({top:0,behavior:"smooth"});
 if(tab==="food")renderFoodResults($("foodSearch").value||"");
}
document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>showTab(b.dataset.tab)));
document.addEventListener("click",e=>{
 const foodButton=e.target.closest("[data-food]");if(foodButton){const f=foods.find(x=>x.id===foodButton.dataset.food);if(f)addFood(f);}
 const remove=e.target.closest("[data-remove]");if(remove){state.logs=state.logs.filter(x=>x.logId!==remove.dataset.remove);saveState();render();toast("ลบรายการแล้ว");}
 if(e.target.closest("[data-goto-food]"))showTab("food");
});
$("foodSearch").addEventListener("input",e=>renderFoodResults(e.target.value));
$("customFoodForm").addEventListener("submit",e=>{
 e.preventDefault();const f={id:"custom-"+Date.now(),name:$("customName").value.trim(),kcal:Number($("customKcal").value),protein:Number($("customProtein").value),carbs:Number($("customCarbs").value||0),fat:Number($("customFat").value||0),serving:"กำหนดเอง",emoji:"🍽️"};
 if(!f.name)return;addFood(f);e.target.reset();$("customCarbs").value=0;$("customFat").value=0;
});
$("goalForm").addEventListener("submit",e=>{
 e.preventDefault();state.goals={kcal:Math.max(500,Number($("goalKcal").value)||2000),protein:Math.max(1,Number($("goalProtein").value)||130),name:$("displayName").value.trim(),weight:$("weight").value};saveState();render();toast("บันทึกเป้าหมายแล้ว");
});
$("exportData").addEventListener("click",()=>{
 const blob=new Blob([JSON.stringify({exportedAt:new Date().toISOString(),...state},null,2)],{type:"application/json"});
 const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="kalcal-data.json";a.click();URL.revokeObjectURL(url);
});
$("clearData").addEventListener("click",()=>{
 if(confirm("ต้องการลบรายการอาหารและเป้าหมายที่เก็บไว้ในอุปกรณ์นี้ทั้งหมดหรือไม่?")){localStorage.removeItem(STORAGE_KEY);state=loadState();render();toast("ล้างข้อมูลแล้ว");}
});
$("startScan").addEventListener("click",startScanner);
$("stopScan").addEventListener("click",stopScanner);
$("barcodeForm").addEventListener("submit",e=>{e.preventDefault();const code=$("barcodeInput").value.trim();if(code)lookupBarcode(code);});
async function startScanner(){
 const video=$("scannerVideo"),status=$("scanStatus");
 if(!navigator.mediaDevices?.getUserMedia){status.textContent="เบราว์เซอร์นี้ไม่รองรับกล้อง กรุณากรอกรหัสบาร์โค้ดเอง";return;}
 if(!("BarcodeDetector" in window)){status.textContent="เบราว์เซอร์นี้ยังไม่รองรับการตรวจจับบาร์โค้ดในตัว กรุณากรอกรหัสบาร์โค้ดเอง หรือเปิดใน Chrome/Android ที่รองรับ";return;}
 try{
  barcodeDetector=new BarcodeDetector({formats:["ean_13","ean_8","upc_a","upc_e","code_128"]});
  scannerStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:"environment"}},audio:false});
  video.srcObject=scannerStream;video.classList.remove("hidden");$("stopScan").classList.remove("hidden");await video.play();status.textContent="เล็งกล้องไปที่บาร์โค้ด...";
  const tick=async()=>{if(!scannerStream)return;try{const codes=await barcodeDetector.detect(video);if(codes.length){status.textContent=`พบรหัส ${codes[0].rawValue} กำลังค้นหา...`;stopScanner();lookupBarcode(codes[0].rawValue);return;}}catch{}scanLoop=requestAnimationFrame(tick);};tick();
 }catch(err){status.textContent="เปิดกล้องไม่ได้ ตรวจสอบสิทธิ์กล้องและเปิดเว็บผ่าน HTTPS";}
}
function stopScanner(){if(scanLoop)cancelAnimationFrame(scanLoop);scanLoop=null;if(scannerStream){scannerStream.getTracks().forEach(t=>t.stop());scannerStream=null;}const v=$("scannerVideo");v.pause();v.srcObject=null;v.classList.add("hidden");$("stopScan").classList.add("hidden");}
async function lookupBarcode(code){
 const status=$("scanStatus"),target=$("barcodeResult");status.textContent="กำลังค้นหาสินค้า...";target.innerHTML="";
 try{
  const r=await fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json?fields=product_name,product_name_th,brands,nutriments,serving_size,image_front_url`);
  if(!r.ok)throw new Error("network");const j=await r.json();
  if(j.status!==1||!j.product)throw new Error("notfound");
  const p=j.product,n=p.nutriments||{},kcal=Number(n["energy-kcal_100g"]??(n["energy_100g"]?n["energy_100g"]/4.184:0));
  const item={id:"barcode-"+code,name:p.product_name_th||p.product_name||"สินค้าไม่มีชื่อ",kcal:Math.round(kcal||0),protein:Number(n.proteins_100g)||0,carbs:Number(n.carbohydrates_100g)||0,fat:Number(n.fat_100g)||0,serving:"ต่อ 100 กรัม",emoji:"📦",barcode:code};
  target.innerHTML=`<article class="result-card"><h2>${escapeHtml(item.name)}</h2><p class="helper">ข้อมูลต่อ 100 กรัม · ${escapeHtml(p.brands||"ไม่ระบุแบรนด์")}</p><div class="result-nutrients"><div><span>พลังงาน</span><b>${num(item.kcal)} kcal</b></div><div><span>โปรตีน</span><b>${num(item.protein)} g</b></div><div><span>คาร์โบไฮเดรต</span><b>${num(item.carbs)} g</b></div><div><span>ไขมัน</span><b>${num(item.fat)} g</b></div></div><button id="addBarcodeResult" class="primary" style="width:100%">＋ เพิ่มลงบันทึก (ต่อ 100 กรัม)</button></article>`;
  $("addBarcodeResult").addEventListener("click",()=>addFood(item));status.textContent="พบข้อมูลสินค้าแล้ว";
 }catch(e){status.textContent=e.message==="notfound"?"ไม่พบรหัสนี้ใน Open Food Facts ลองกรอกเองหรือค้นหาชื่ออาหาร": "ค้นหาไม่สำเร็จ ตรวจสอบอินเทอร์เน็ตแล้วลองอีกครั้ง";}
}
$("takePhoto").addEventListener("click",()=>$("photoInput").click());
$("photoInput").addEventListener("change",e=>{
 const file=e.target.files?.[0];if(!file)return;
 if(file.size>12*1024*1024){toast("รูปใหญ่เกินไป กรุณาเลือกรูปไม่เกิน 12 MB");return;}
 const reader=new FileReader();reader.onload=()=>{photoDataUrl=reader.result;$("photoPreview").innerHTML=`<img src="${photoDataUrl}" alt="ตัวอย่างรูปอาหาร">`;$("analyzePhoto").disabled=false;$("aiStatus").textContent="เลือกรูปแล้ว พร้อมเชื่อมต่อ AI เมื่อมี backend";};reader.readAsDataURL(file);
});
$("analyzePhoto").addEventListener("click",()=>{$("aiStatus").textContent="AI วิเคราะห์ภาพจริงยังไม่เชื่อมต่อ ต้องตั้งค่า backend ที่ปลอดภัยก่อนเปิดใช้งาน ไม่ได้ส่งรูปไปที่ใดในเวอร์ชันนี้";});
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredInstallPrompt=e;$("installBtn").classList.remove("hidden");});
$("installBtn").addEventListener("click",async()=>{if(!deferredInstallPrompt){toast("บน iPhone ให้กด Share แล้วเลือก Add to Home Screen");return;}deferredInstallPrompt.prompt();await deferredInstallPrompt.userChoice;deferredInstallPrompt=null;$("installBtn").classList.add("hidden");});
if("serviceWorker" in navigator && location.protocol.startsWith("http"))window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
render();
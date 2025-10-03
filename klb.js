(function(){
  let sniperActive=false;
  let selectedHour="18:00-18:59";
  let CYCLE_DELAY=13000;
  let panelMinimized=false;
  let countdownInterval;

  function updateStatus(text){
    const statusEl = document.getElementById("sniperStatus");
    if(statusEl) statusEl.innerText = text;
    console.log(text);
  }

  function checkForSuccessPopup(){
    const popup=document.querySelector(".swal2-popup.swal2-show.swal2-modal.swal2-icon-success");
    const htmlContainer=document.getElementById("swal2-html-container");
    if(popup && htmlContainer && htmlContainer.innerText.includes("Awizacja o numerze") && htmlContainer.innerText.includes("została utworzona")){
      updateStatus("🎃 Awizacja zakończona sukcesem – zatrzymuję klikacz 👻");
      sniperActive=false;
      document.getElementById("sniperToggleBtn").innerText="START 🎃";
      clearInterval(countdownInterval);
      return true;
    }
    return false;
  }

  function runSniperCycle(){
    if(!sniperActive) return;
    if(checkForSuccessPopup()) return;

    updateStatus("🕸️ Szukam slotu: " + selectedHour);
    const btn=[...document.querySelectorAll("button.slot-btn")].find(b=>b.innerText.includes(selectedHour));
    if(btn){
      btn.removeAttribute("disabled");
      updateStatus("💀 Klikam slot: " + btn.innerText);
      btn.click();
      setTimeout(()=>{
        const submit=document.querySelector("#submitBtn");
        if(submit){
          updateStatus("👉 Klikam OK");
          submit.click();
          setTimeout(()=>{
            const confirm=document.querySelector(".swal2-confirm");
            if(confirm){
              updateStatus("🕷️ Klikam TAK");
              confirm.click();
            } else {
              updateStatus("⚠️ Brak przycisku TAK");
            }
            sniperActive && startCountdown();
          },1000);
        } else {
          updateStatus("⚠️ Brak przycisku OK – kolejna próba za "+CYCLE_DELAY/1000+"s");
          startCountdown();
        }
      },1000);
    } else {
      updateStatus("👻 Brak slotu – kolejna próba za "+CYCLE_DELAY/1000+"s");
      startCountdown();
    }
  }

  function startCountdown(){
    let timeLeft=CYCLE_DELAY/1000;
    clearInterval(countdownInterval);
    countdownInterval=setInterval(()=>{
      if(!sniperActive){
        clearInterval(countdownInterval);
        return;
      }
      if(checkForSuccessPopup()){
        clearInterval(countdownInterval);
        return;
      }
      updateStatus("⏳ Kolejna próba za: " + timeLeft + "s");
      if(timeLeft<=0){
        clearInterval(countdownInterval);
        runSniperCycle();
      }
      timeLeft--;
    },1000);
  }

  function createSniperControl(){
    const old=document.getElementById("sniperPanel");
    if(old) old.remove();

    const hours=Array.from({length:24},(_,i)=>{
      const h=i.toString().padStart(2,'0');
      return `${h}:00-${h}:59`;
    });

    const panel=document.createElement("div");
    panel.id="sniperPanel";
    panel.style=`
      position:fixed;
      bottom:20px;right:20px;
      padding:14px;
      background:linear-gradient(145deg,#1c0f2e,#2b0033);
      color:#ff7518;
      border:2px solid #ff7518;
      border-radius:12px;
      z-index:9999;
      font-family:"Trebuchet MS",sans-serif;
      width:220px;
      box-shadow:0 0 20px rgba(255,117,24,0.7);
      text-shadow:0 0 5px black;
    `;

    const options=hours.map(h=>
      `<option value="${h}" ${h===selectedHour?"selected":""}>${h}</option>`
    ).join("");

    panel.innerHTML=`
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <b style="color:#ff7518;font-size:16px;">🎃 BHub Clicker 👻</b>
        <button id="sniperMinBtn" style="background:none;border:none;color:#ff7518;font-size:16px;cursor:pointer;">−</button>
      </div>
      <div id="sniperContent">
        <div style="margin-top:8px;color:#ffb347;">Przedział godzin:</div>
        <select id="sniperHour" style="width:100%;margin-top:5px;padding:5px;font-size:14px;color:#2b0033;background:#ffb347;border:2px solid #ff7518;border-radius:6px;">
          ${options}
        </select><br>

        <div style="margin-top:10px;color:#ffb347;">Opóźnienie (s):</div>
        <input id="sniperDelay" type="number" value="${CYCLE_DELAY/1000}"
          style="width:100%;margin-top:5px;padding:5px;font-size:14px;color:#2b0033;background:#ffb347;border:2px solid #ff7518;border-radius:6px;">

        <button id="sniperSetDelay"
          style="padding:6px;margin-top:10px;width:100%;cursor:pointer;background:#ff7518;color:black;font-weight:bold;border:none;border-radius:6px;box-shadow:0 0 10px #ff7518;">
          🕷️ USTAW OPÓŹNIENIE
        </button><br>

        <button id="sniperToggleBtn"
          style="padding:6px;margin-top:10px;width:100%;cursor:pointer;background:#6a0dad;color:#ffb347;font-weight:bold;border:none;border-radius:6px;box-shadow:0 0 10px #6a0dad;">
          START 🎃
        </button>

        <div id="sniperStatus" style="margin-top:10px;font-size:12px;color:#ffb347;">👻 Status: gotowy</div>
      </div>
    `;

    document.body.appendChild(panel);

    document.getElementById("sniperMinBtn").onclick=()=>{
      panelMinimized=!panelMinimized;
      document.getElementById("sniperContent").style.display=panelMinimized?"none":"block";
      document.getElementById("sniperMinBtn").innerText=panelMinimized?"+":"−";
    };

    document.getElementById("sniperHour").onchange=()=>{
      selectedHour=document.getElementById("sniperHour").value;
      updateStatus("🕸️ Zmieniono godzinę na: " + selectedHour);
    };

    document.getElementById("sniperSetDelay").onclick=()=>{
      const val=parseInt(document.getElementById("sniperDelay").value);
      if(!isNaN(val)&&val>0){
        CYCLE_DELAY=val*1000;
        updateStatus("⏱️ Zmieniono opóźnienie na: " + val + "s");
      }
    };

    document.getElementById("sniperToggleBtn").onclick=()=>{
      sniperActive=!sniperActive;
      document.getElementById("sniperToggleBtn").innerText=sniperActive?"STOP 💀":"START 🎃";
      updateStatus("🎃 BHub Clicker: " + (sniperActive?"AKTYWNY":"WYŁĄCZONY"));
      if(sniperActive){ runSniperCycle(); } else { clearInterval(countdownInterval); }
    };
  }

  createSniperControl();
})();

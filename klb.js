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
      updateStatus("✅ Awizacja zakończona sukcesem – zatrzymuję klikacz ☀️");
      sniperActive=false;
      document.getElementById("sniperToggleBtn").innerText="START ☀️";
      clearInterval(countdownInterval);
      return true;
    }
    return false;
  }

  function runSniperCycle(){
    if(!sniperActive) return;
    if(checkForSuccessPopup()) return;

    updateStatus("🌊 Szukam slotu: " + selectedHour);
    const btn=[...document.querySelectorAll("button.slot-btn")].find(b=>b.innerText.includes(selectedHour));
    if(btn){
      btn.removeAttribute("disabled");
      updateStatus("🌴 Klikam slot: " + btn.innerText);
      btn.click();
      setTimeout(()=>{
        const submit=document.querySelector("#submitBtn");
        if(submit){
          updateStatus("👉 Klikam OK");
          submit.click();
          setTimeout(()=>{
            const confirm=document.querySelector(".swal2-confirm");
            if(confirm){
              updateStatus("🌺 Klikam TAK");
              confirm.click();
            } else {
              updateStatus("⚠️ Brak przycisku TAK");
            }
            sniperActive && startCountdown();
          }, 400); // <== 0.3 sekundy między OK i TAK
        } else {
          updateStatus("⚠️ Brak przycisku OK – kolejna próba za "+CYCLE_DELAY/1000+"s");
          startCountdown();
        }
      }, 400); // <== 0.3 sekundy po kliknięciu slotu
    } else {
      updateStatus("⛱️ Brak slotu – kolejna próba za "+CYCLE_DELAY/1000+"s");
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
      background:linear-gradient(135deg, #a8edea, #fed6e3);
      color:#005f73;
      border:2px solid #fbbf24;
      border-radius:12px;
      z-index:9999;
      font-family:'Trebuchet MS',sans-serif;
      width:240px;
      box-shadow:0 0 15px rgba(0,191,255,0.7);
      text-shadow:0 0 3px #ffffff;
    `;

    const options=hours.map(h=>
      `<option value="${h}" ${h===selectedHour?"selected":""}>${h}</option>`
    ).join("");

    panel.innerHTML=`
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <b style="color:#005f73;font-size:16px;">☀️ BHub Clicker 🌊</b>
        <button id="sniperMinBtn" style="background:none;border:none;color:#e63946;font-size:16px;cursor:pointer;">−</button>
      </div>
      <div id="sniperContent">
        <div style="margin-top:8px;color:#006d77;">Przedział godzin:</div>
        <select id="sniperHour" style="width:100%;margin-top:5px;padding:5px;font-size:14px;color:#006d77;background:#fefae0;border:2px solid #fbbf24;border-radius:6px;">
          ${options}
        </select><br>

        <div style="margin-top:10px;color:#006d77;">Opóźnienie (s):</div>
        <input id="sniperDelay" type="number" value="${CYCLE_DELAY/1000}"
          style="width:100%;margin-top:5px;padding:5px;font-size:14px;color:#006d77;background:#fefae0;border:2px solid #fbbf24;border-radius:6px;">

        <button id="sniperSetDelay"
          style="padding:6px;margin-top:10px;width:100%;cursor:pointer;background:#fbbf24;color:#005f73;font-weight:bold;border:none;border-radius:6px;box-shadow:0 0 10px #ffd60a;">
          🐠 USTAW OPÓŹNIENIE
        </button><br>

        <button id="sniperToggleBtn"
          style="padding:6px;margin-top:10px;width:100%;cursor:pointer;background:#2ec4b6;color:#ffffff;font-weight:bold;border:none;border-radius:6px;box-shadow:0 0 10px #2ec4b6;">
          START ☀️
        </button>

        <div id="sniperStatus" style="margin-top:10px;font-size:12px;color:#006d77;">⛱️ Status: gotowy</div>
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
      updateStatus("🌅 Zmieniono godzinę na: " + selectedHour);
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
      document.getElementById("sniperToggleBtn").innerText=sniperActive?"STOP 🛑":"START ☀️";
      updateStatus("🌞 BHub Clicker: " + (sniperActive?"AKTYWNY":"WYŁĄCZONY"));
      if(sniperActive){ runSniperCycle(); } else { clearInterval(countdownInterval); }
    };
  }

  createSniperControl();
})();

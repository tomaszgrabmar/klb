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
    const popup = document.querySelector(".swal2-popup.swal2-show.swal2-modal.swal2-icon-success");
    const htmlContainer = document.getElementById("swal2-html-container");
    if(popup && htmlContainer && htmlContainer.innerText.includes("Awizacja o numerze") && htmlContainer.innerText.includes("została utworzona")){
      updateStatus("✅ Awizacja zakończona sukcesem – zatrzymuję klikacz");
      sniperActive = false;
      document.getElementById("sniperToggleBtn").innerText = "START";
      document.getElementById("sniperPanel").classList.remove("active");
      clearInterval(countdownInterval);
      return true;
    }
    return false;
  }

  function runSniperCycle(){
    if(!sniperActive) return;
    if(checkForSuccessPopup()) return;

    updateStatus("🔄 Szukam slotu: " + selectedHour);
    const btn = [...document.querySelectorAll("button.slot-btn")].find(b => b.innerText.includes(selectedHour));
    if(btn){
      btn.removeAttribute("disabled");
      updateStatus("💥 Klikam slot: " + btn.innerText);
      btn.click();
      setTimeout(()=>{
        const submit = document.querySelector("#submitBtn");
        if(submit){
          updateStatus("👉 Klikam OK");
          submit.click();
          setTimeout(()=>{
            const confirm = document.querySelector(".swal2-confirm");
            if(confirm){
              updateStatus("✅ Klikam TAK");
              confirm.click();
            } else {
              updateStatus("⚠️ Brak przycisku TAK");
            }
            sniperActive && startCountdown();
          },1000);
        } else {
          updateStatus("⚠️ Brak przycisku OK – kolejna próba za " + CYCLE_DELAY/1000 + "s");
          startCountdown();
        }
      },1000);
    } else {
      updateStatus("🌊 Brak slotu – kolejna próba za " + CYCLE_DELAY/1000 + "s");
      startCountdown();
    }
  }

  function startCountdown(){
    let timeLeft = CYCLE_DELAY / 1000;
    clearInterval(countdownInterval);
    countdownInterval = setInterval(() => {
      if(!sniperActive){
        clearInterval(countdownInterval);
        return;
      }
      if(checkForSuccessPopup()){
        clearInterval(countdownInterval);
        return;
      }
      updateStatus("⏳ Kolejna próba za: " + timeLeft + "s");
      if(timeLeft <= 0){
        clearInterval(countdownInterval);
        runSniperCycle();
      }
      timeLeft--;
    }, 1000);
  }

  function injectHalloweenStyles(){
    if(document.getElementById("sniperHalloweenCSS")) return;
    const css = `
      #sniperPanel{
        background: linear-gradient(180deg, #8FSFEA 0%, #000 100%);
        color:#fff;
        border:2px solid orange;
        border-radius:12px;
        box-shadow:0 0 15px rgba(255,120,0,0.6), inset 0 0 10px rgba(143,95,234,0.4);
        font-family:Arial, sans-serif;
        width:220px;
        padding:12px;
        z-index:9999;
        position:fixed;
        bottom:20px;right:20px;
      }
      #sniperPanel.active{
        box-shadow:0 0 25px orange;
      }
      #sniperPanel b{
        color:orange;
        text-shadow:0 0 6px #8FSFEA;
      }
      #sniperPanel select,
      #sniperPanel input{
        width:100%;
        margin-top:5px;
        padding:5px;
        border-radius:6px;
        border:1px solid orange;
        color:#111;
      }
      #sniperPanel button{
        margin-top:6px;
        width:100%;
        padding:6px;
        border:none;
        border-radius:6px;
        cursor:pointer;
        font-weight:bold;
      }
      #sniperSetDelay{
        background:orange;
        color:black;
      }
      #sniperToggleBtn{
        background:black;
        color:#fff;
        border:1px solid orange;
      }
      #sniperStatus{
        margin-top:6px;
        font-size:12px;
        color:#8FSFEA;
        text-shadow:0 0 4px orange;
      }
    `;
    const style = document.createElement("style");
    style.id="sniperHalloweenCSS";
    style.innerText = css;
    document.head.appendChild(style);
  }

  function createSniperControl(){
    const old = document.getElementById("sniperPanel");
    if(old) old.remove();

    injectHalloweenStyles();

    const hours = Array.from({length: 24}, (_, i) => {
      const h = i.toString().padStart(2, '0');
      return `${h}:00-${h}:59`;
    });

    const panel = document.createElement("div");
    panel.id = "sniperPanel";

    const options = hours.map(h =>
      `<option value="${h}" ${h===selectedHour?"selected":""}>${h}</option>`
    ).join("");

    panel.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <b>🎃 BHub Clicker 💀</b>
        <button id="sniperMinBtn" style="background:none;border:none;color:orange;font-size:14px;cursor:pointer;">🕸️</button>
      </div>
      <div id="sniperContent">
        <div style="margin-top:5px;">Przedział godzin:</div>
        <select id="sniperHour">${options}</select>
        <div style="margin-top:8px;">Opóźnienie (s):</div>
        <input id="sniperDelay" type="number" value="${CYCLE_DELAY/1000}">
        <button id="sniperSetDelay">⚙️ USTAW OPÓŹNIENIE</button>
        <button id="sniperToggleBtn">START</button>
        <div id="sniperStatus">⚓ Status: gotowy</div>
      </div>
    `;

    document.body.appendChild(panel);

    document.getElementById("sniperMinBtn").onclick = ()=>{
      panelMinimized = !panelMinimized;
      document.getElementById("sniperContent").style.display = panelMinimized ? "none" : "block";
      document.getElementById("sniperMinBtn").innerText = panelMinimized ? "+" : "🕸️";
    };

    document.getElementById("sniperHour").onchange = ()=>{
      selectedHour = document.getElementById("sniperHour").value;
      updateStatus("⏱️ Zmieniono godzinę na: " + selectedHour);
    };

    document.getElementById("sniperSetDelay").onclick = ()=>{
      const val = parseInt(document.getElementById("sniperDelay").value);
      if(!isNaN(val) && val > 0){
        CYCLE_DELAY = val * 1000;
        updateStatus("⏱️ Zmieniono opóźnienie na: " + val + "s");
      }
    };

    document.getElementById("sniperToggleBtn").onclick = ()=>{
      sniperActive = !sniperActive;
      document.getElementById("sniperToggleBtn").innerText = sniperActive ? "STOP" : "START";
      document.getElementById("sniperPanel").classList.toggle("active", sniperActive);
      updateStatus("🎃 BHub Clicker: " + (sniperActive ? "AKTYWNY" : "WYŁĄCZONY"));
      if(sniperActive){
        runSniperCycle();
      } else {
        clearInterval(countdownInterval);
      }
    };
  }

  createSniperControl();
})();

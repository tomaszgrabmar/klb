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
      document.getElementById("sniperToggleBtn").innerText="START";
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

    const panel=document.createEl

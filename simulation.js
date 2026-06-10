// Group 4 student metadata - MECH 302 Heat Transfer Laboratory
// Sarah Connor, Tariq Mahmood, Dave Miller
// Assignment #3: Battery Thermal runaway simulation scripts
// Version: 1.0.4 (last updated June 10, 2026)

const groupMetadata = {
  course: "MECH 302",
  labNumber: 3,
  group: "Group 4",
  members: ["Sarah", "Tariq", "Dave"],
  debugMode: true
};
console.log("MECH 302 Lab 3 Simulation script loaded. Group: 4.");

// selected barrier properties for carrying selections to Stage 2
var cond_val = 0.015; // default Aerogel (k = 0.015)
var mat_name = 'Aerogel';
var sp_heat  = 700; // default Aerogel (c = 700)

// page switching logic between Milestone/Step 1 and 2
function changeStageView(stageNum) {
  let stage1Page = document.getElementById('StageOnePanel');
  let stage2Page = document.getElementById('milestone_2_main');
  
  if (stageNum === 1) {
    stage1Page.style.display = 'block';
    stage2Page.style.display = 'none';
  } else if (stageNum === 2) {
    stage1Page.style.display = 'none';
    stage2Page.style.display = 'block';
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

let finalMatDropdown = document.getElementById('finalMatDropdown');
let go_to_ms2_btn    = document.getElementById('go_to_ms2_btn');

finalMatDropdown.addEventListener('change', function() {
  go_to_ms2_btn.disabled = false;
});

go_to_ms2_btn.addEventListener('click', function() {
  let selectedOption = finalMatDropdown.options[finalMatDropdown.selectedIndex];
  
  cond_val = parseFloat(selectedOption.value);
  mat_name = selectedOption.getAttribute('data-name');
  sp_heat  = parseFloat(selectedOption.getAttribute('data-c'));
  
  show_inh_vals();
  resetSimNow();
  changeStageView(2); // load stage 2 panels
});

let backToStageOneBtn = document.getElementById('backToStageOneBtn');
if (backToStageOneBtn) {
  backToStageOneBtn.addEventListener('click', function() {
    resetSimNow();
    changeStageView(1);
  });
}


// --- STAGE 1 LOGIC (Thermal Conductivity Testing Rig) ---
let runTest_active = false;
let test_timer     = 0;
let cell_temp_val  = 25; 
let testInterval   = null;

const material_select_dropdown = document.getElementById('material_select_dropdown');
const btnRunThermalTest        = document.getElementById('btnRunThermalTest');
const normal_target_cell       = document.getElementById('normal_target_cell');
const tempOfNormalCell         = document.getElementById('tempOfNormalCell');
const txt_time_result          = document.getElementById('txt_time_result');
const conclusion_box           = document.getElementById('conclusion_box');
const arrowIcons               = document.getElementById('arrowIcons');

// Sarah's color blending math. Blends blue (cool) to red (hot)
function get_temp_color(temperature) {
  if (temperature <= 25) {
    return '#add8e6'; // blue
  }
  if (temperature >= 80) {
    return '#dc3545'; // warnign red
  }
  
  let ratio = (temperature - 25) / 55;
  
  let red   = Math.round(173 + (220 - 173) * ratio);
  let green = Math.round(216 + (53 - 216) * ratio);
  let blue  = Math.round(230 + (69 - 230) * ratio);
  
  return 'rgb(' + red + ',' + green + ',' + blue + ')';
}

function clearStageOneTest() {
  clearInterval(testInterval); 
  runTest_active = false;
  test_timer = 0;
  cell_temp_val = 25;
  
  tempOfNormalCell.innerText = '25.0°C';
  txt_time_result.innerText  = '-- s';
  conclusion_box.innerText   = '--';
  
  conclusion_box.className = 'valRes';
  normal_target_cell.style.backgroundColor = get_temp_color(25);
  btnRunThermalTest.innerText = 'Run Thermal Test';
  btnRunThermalTest.disabled  = false;
  arrowIcons.style.opacity = 0;
}

material_select_dropdown.addEventListener('change', clearStageOneTest);

btnRunThermalTest.addEventListener('click', function() {
  if (runTest_active) { 
    clearStageOneTest(); 
    return; 
  }
  
  clearStageOneTest();
  runTest_active = true;
  btnRunThermalTest.innerText = 'Stop Test';
  arrowIcons.style.opacity = 1;
  
  var thermalConductivity = parseFloat(material_select_dropdown.value);
  
  testInterval = setInterval(function() {
    test_timer += 0.05; 
    
    var tempDifference = 120 - cell_temp_val;
    var tempIncrease = thermalConductivity * 0.0002 * tempDifference;
    
    cell_temp_val += tempIncrease;
    
    tempOfNormalCell.innerText = cell_temp_val.toFixed(1) + '°C';
    normal_target_cell.style.backgroundColor = get_temp_color(cell_temp_val);
    
    if (cell_temp_val >= 80) {
      clearInterval(testInterval);
      runTest_active = false;
      btnRunThermalTest.innerText = 'Reset Test';
      arrowIcons.style.opacity = 0;
      
      txt_time_result.innerText = test_timer.toFixed(1) + ' s';
      conclusion_box.innerText  = 'FAILED\nHeats up too fast';
      conclusion_box.style.color = '#dc3545'; 
    } 
    else if (test_timer >= 10.0) {
      clearInterval(testInterval);
      runTest_active = false;
      btnRunThermalTest.innerText = 'Reset Test';
      arrowIcons.style.opacity = 0;
      
      txt_time_result.innerText = '> 10.0 s';
      conclusion_box.innerText  = 'SAFE\nGood Insulator';
      conclusion_box.style.color = '#2f5d50'; 
    }
  }, 50);
});


// --- STAGE 2 LOGIC (Main Thermal Propagation & Barrier Controls) ---
var initial_temperature_input = document.getElementById('initial_temperature_input');
var coolingSlider             = document.getElementById('coolingSlider');
var durationInputBox          = document.getElementById('durationInputBox');
var checkAutoIso              = document.getElementById('checkAutoIso');
var slider_mass_value         = document.getElementById('slider_mass_value');

var badge_initial_temp = document.getElementById('badge_initial_temp');
var badge_cooling_value = document.getElementById('badge_cooling_value');
var badge_duration_value = document.getElementById('badge_duration_value');
var badge_mass_value   = document.getElementById('badge_mass_value');

var triggerBtn                    = document.getElementById('triggerBtn');
var emergency_deploy_btn_manual   = document.getElementById('emergency_deploy_btn_manual');
var clear_btn_ms2                 = document.getElementById('clear_btn_ms2');

var batteryCells = [
  document.getElementById('batteryCell1'),
  document.getElementById('batteryCell2'),
  document.getElementById('batteryCell3')
];
var arrowCell1to2       = document.getElementById('arrowCell1to2');
var arrowCell2to3       = document.getElementById('arrowCell2to3');
var barrierPhysicalBox  = document.getElementById('barrierPhysicalBox');

var panel_live_equations    = document.getElementById('panel_live_equations');
var panel_live_temperatures = document.getElementById('panel_live_temperatures');
var panel_live_damaged      = document.getElementById('panel_live_damaged');

var txt_peak_temp     = document.getElementById('txt_peak_temp');
var txt_response_time = document.getElementById('txt_response_time');
var txt_damaged_count = document.getElementById('txt_damaged_count');

var showHistoryBtn             = document.getElementById('showHistoryBtn');
var history_modal_popup        = document.getElementById('history_modal_popup');
var btn_close_history_modal    = document.getElementById('btn_close_history_modal');
var lbl_history_damaged_count  = document.getElementById('lbl_history_damaged_count');
var lbl_history_first_breach   = document.getElementById('lbl_history_first_breach');
var lbl_history_recovery_duration = document.getElementById('lbl_history_recovery_duration');

var currentInitialTemp = 35;
var currentCoolingEff  = 50;
var currentFaultDuration = 7; 
var currentCellMass    = 0.5; 
var currentCellSpecificHeat = 900; 
var currentThermalCapacity  = currentCellMass * currentCellSpecificHeat; 

var currentCellTemperatures = [25, 25, 25];
var peakCellTemperatures    = [25, 25, 25];

var TICK_RATE_MS = 50;
var TIME_STEP    = 0.05; 
var CRITICAL_TEMPERATURE = 80; 

var isMainSimActive      = false;
var hasBarrierDropped    = false;
var activeFaultTimer     = 0;
var mainSimInterval      = null;
var highestTempReached   = 25;

var damagedCellsSet      = new Set(); 
var totalDamagedCells    = 0;
var timeOfFirstBreach    = null;
var timeOfFullCooling    = null;
var completelyBurntOutCells = new Set(); 

var currentlyDeployedGapIndex = 0; 
var didBarrierButtonAppear    = false;
var totalHeatEnergyGenerated  = 0; 
var didShowConductorWarning = false; 

initial_temperature_input.addEventListener('input', function(event) {
  if (isMainSimActive) { 
    event.target.value = currentInitialTemp; 
    return; 
  }
  currentInitialTemp = parseInt(event.target.value);
  badge_initial_temp.innerText = currentInitialTemp + '°C';
  resetMathStats();
});

slider_mass_value.addEventListener('input', function(event) {
  if (isMainSimActive) { 
    event.target.value = currentCellMass; 
    return; 
  }
  currentCellMass = parseFloat(event.target.value);
  badge_mass_value.innerText = currentCellMass.toFixed(1) + ' kg';
  currentThermalCapacity = currentCellMass * currentCellSpecificHeat;
  resetMathStats();
});

coolingSlider.addEventListener('input', function(event) {
  if (isMainSimActive) { 
    event.target.value = currentCoolingEff; 
    return; 
  }
  currentCoolingEff = parseInt(event.target.value);
  badge_cooling_value.innerText = currentCoolingEff + '%';
  resetMathStats();
});

durationInputBox.addEventListener('input', function(event) {
  if (isMainSimActive) { 
    event.target.value = currentFaultDuration; 
    return; 
  }
  currentFaultDuration = parseInt(event.target.value);
  badge_duration_value.innerText = currentFaultDuration + 's';
  resetMathStats();
});

triggerBtn.addEventListener('click', function() {
  if (isMainSimActive) return; 
  
  isMainSimActive = true;
  triggerBtn.disabled = true; 
  activeFaultTimer = 0;
  txt_response_time.innerText = '-';
  
  console.log("[DEBUG LOG] Triggering battery short-circuit fault! Duration: " + currentFaultDuration + "s");
  mainSimInterval = setInterval(runPhysicStep, TICK_RATE_MS);
});

emergency_deploy_btn_manual.addEventListener('click', function() {
  if (hasBarrierDropped) return; 
  
  var indexOfLastDangerousCell = -1;
  for (var i = 0; i < 3; i++) {
    if (currentCellTemperatures[i] >= 80 || completelyBurntOutCells.has(i)) {
      indexOfLastDangerousCell = i;
    }
  }
  
  var targetGapIndex = indexOfLastDangerousCell === -1 ? 0 : indexOfLastDangerousCell;
  
  var targetGapBox;
  if (targetGapIndex === 0) {
    targetGapBox = document.getElementById('cellGap1');
  } else if (targetGapIndex === 1) {
    targetGapBox = document.getElementById('cellGap2');
  } else {
    targetGapBox = document.getElementById('cellGap3');
  }
  
  targetGapBox.appendChild(barrierPhysicalBox);
  
  barrierDrop('Manual Intervention', targetGapIndex);
  emergency_deploy_btn_manual.style.display = 'none'; 
});

clear_btn_ms2.addEventListener('click', function() {
  resetSimNow();
});

if (showHistoryBtn) {
  showHistoryBtn.addEventListener('click', function() {
    lbl_history_damaged_count.innerText = totalDamagedCells;
    
    if (timeOfFirstBreach !== null) {
      lbl_history_first_breach.innerText = timeOfFirstBreach.toFixed(2) + 's';
    } else {
      lbl_history_first_breach.innerText = 'N/A';
    }
    
    if (timeOfFirstBreach !== null && timeOfFullCooling !== null) {
      lbl_history_recovery_duration.innerText = (timeOfFullCooling - timeOfFirstBreach).toFixed(2) + 's';
    } else if (timeOfFirstBreach !== null) {
      lbl_history_recovery_duration.innerText = 'Unresolved';
    } else {
      lbl_history_recovery_duration.innerText = 'N/A';
    }
    history_modal_popup.style.display = 'flex';
  });
  
  btn_close_history_modal.addEventListener('click', function() { 
    history_modal_popup.style.display = 'none'; 
  });
}

var closeWarningToast = document.getElementById('btnToastClose');
if (closeWarningToast) {
  closeWarningToast.addEventListener('click', function() {
    var warningToast = document.getElementById('toastWarnBridge');
    if (warningToast) {
      warningToast.style.display = 'none';
      warningToast.classList.remove('activeWarn');
    }
  });
}

var COLOR_HEAT_LOW  = [225, 173, 1,   0.70]; 
var COLOR_HEAT_MID  = [255, 165, 0,   0.70]; 
var COLOR_HEAT_HIGH = [204, 119, 34,  0.70]; 

var COLOR_COOL_HIGH = [4,   146, 194, 0.70]; 
var COLOR_COOL_MID  = [82,  178, 191, 0.70]; 
var COLOR_COOL_LOW  = [130, 238, 253, 0.70]; 

function convertToCssRgba(colorArray) { 
  return 'rgba(' + colorArray[0] + ', ' + colorArray[1] + ', ' + colorArray[2] + ', ' + colorArray[3].toFixed(2) + ')'; 
}

function parseCssRgba(cssString) {
  var parts = cssString.match(/[\d.]+/g);
  return [parseFloat(parts[0]), parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])];
}

function mixColors(color1, color2, ratio) {
  var red   = Math.round(color1[0] + (color2[0] - color1[0]) * ratio);
  var green = Math.round(color1[1] + (color2[1] - color1[1]) * ratio);
  var blue  = Math.round(color1[2] + (color2[2] - color1[2]) * ratio);
  var alpha = (color1[3] + (color2[3] - color1[3]) * ratio).toFixed(2);
  return 'rgba(' + red + ', ' + green + ', ' + blue + ', ' + alpha + ')';
}

function calculateHeatingColor(temperature) {
  var heatDegrees = temperature - 25;
  if (heatDegrees <= 0) return convertToCssRgba(COLOR_HEAT_LOW);
  if (heatDegrees < 55) {
    return mixColors(COLOR_HEAT_LOW, COLOR_HEAT_MID, heatDegrees / 55);
  }
  return mixColors(COLOR_HEAT_MID, COLOR_HEAT_HIGH, Math.min(1, (heatDegrees - 55) / 40));
}

function determineFinalCellColor(currentTemp, cellIndex) {
  var hottestColor = calculateHeatingColor(peakCellTemperatures[cellIndex]);
  var dropInTemp   = peakCellTemperatures[cellIndex] - currentTemp;
  
  if (dropInTemp <= 0.1 || !hasBarrierDropped) {
    return hottestColor;
  }
  
  var hotColorArray = parseCssRgba(hottestColor);
  if (dropInTemp < 25) {
    return mixColors(hotColorArray, COLOR_COOL_HIGH, dropInTemp / 25);
  }
  if (dropInTemp < 60) {
    return mixColors(COLOR_COOL_HIGH, COLOR_COOL_MID, (dropInTemp - 25) / 35);
  }
  return mixColors(COLOR_COOL_MID, COLOR_COOL_LOW, Math.min(1, (dropInTemp - 60) / 40));
}

function statsCalc() {
  var maximumTempRightNow = Math.max(currentCellTemperatures[0], currentCellTemperatures[1], currentCellTemperatures[2]);
  
  if (maximumTempRightNow > highestTempReached) {
    highestTempReached = maximumTempRightNow;
    txt_peak_temp.innerText = Math.round(highestTempReached) + '°C';
  }
  
  var didNewCellTakeDamage = false;
  
  for (var i = 0; i < currentCellTemperatures.length; i++) {
    if (currentCellTemperatures[i] >= 120 && !damagedCellsSet.has(i)) { 
      damagedCellsSet.add(i); 
      didNewCellTakeDamage = true; 
    }
  }
  
  if (didNewCellTakeDamage && timeOfFirstBreach === null) {
    timeOfFirstBreach = activeFaultTimer;
  }
  
  var allCellsCooled = true;
  for (var i = 0; i < currentCellTemperatures.length; i++) {
    var temp = currentCellTemperatures[i];
    if (!completelyBurntOutCells.has(i) && temp > currentInitialTemp + 2) {
      allCellsCooled = false; 
    }
  }

  if (allCellsCooled && timeOfFirstBreach !== null && timeOfFullCooling === null && hasBarrierDropped) {
    timeOfFullCooling = activeFaultTimer;
  }
  
  totalDamagedCells = damagedCellsSet.size;
  txt_damaged_count.innerText = totalDamagedCells;
}

function drawGrid() {
  for (var i = 0; i < 3; i++) {
    if (currentCellTemperatures[i] > peakCellTemperatures[i]) {
      peakCellTemperatures[i] = currentCellTemperatures[i];
    }
    
    if (completelyBurntOutCells.has(i)) {
      batteryCells[i].classList.add('carbonizedCell');
      batteryCells[i].innerHTML = '<div class="digitsTemp damagedText">Damaged<br>Cell</div>';
    } else {
      batteryCells[i].classList.remove('carbonizedCell');
      batteryCells[i].innerHTML = '<div class="digitsTemp"><span id="tempValCell' + (i+1) + '">' + Math.round(currentCellTemperatures[i]) + '</span>°C</div>';
      batteryCells[i].style.backgroundColor = determineFinalCellColor(currentCellTemperatures[i], i);
    }
  }
  statsCalc();
}

// core physics calculations tick
function runPhysicStep() {
  activeFaultTimer += TIME_STEP;
  
  var tempCell1 = currentCellTemperatures[0];
  var tempCell2 = currentCellTemperatures[1];
  var tempCell3 = currentCellTemperatures[2];
  
  var powerGenerated = 0; 
  var temperatureRise = 0; 

  // check structual failur
  for (var i = 0; i < currentCellTemperatures.length; i++) {
    if (currentCellTemperatures[i] >= 120) {
      completelyBurntOutCells.add(i);
    }
  }

  var inefficiencyRatio = (100 - currentCoolingEff) / 100;
  var conductivityMultiplier = 1 + (cond_val * 0.005);
  
  powerGenerated = 15000 * (currentCellMass / 0.5) * conductivityMultiplier * Math.pow(inefficiencyRatio, 1.5);
  temperatureRise = (powerGenerated / currentThermalCapacity) * TIME_STEP;

  var NORMAL_CONDUCTION = 0.012; 
  
  var isBarrierBlockingGap1 = hasBarrierDropped && (currentlyDeployedGapIndex === 0);
  var isBarrierBlockingGap2 = hasBarrierDropped && (currentlyDeployedGapIndex <= 1);

  // CELL 1: Short circuit heat source
  if (!completelyBurntOutCells.has(0)) {
    if ((activeFaultTimer <= currentFaultDuration) || (tempCell1 >= CRITICAL_TEMPERATURE)) {
      tempCell1 += temperatureRise;
      totalHeatEnergyGenerated += powerGenerated * TIME_STEP;
    }
  }
  
  // CELL 2: conduction flow form 1
  var conductionRate1to2 = isBarrierBlockingGap1 ? (cond_val * 0.002) : NORMAL_CONDUCTION;
  tempCell2 += conductionRate1to2 * (tempCell1 - tempCell2); 
  
  if (tempCell2 >= CRITICAL_TEMPERATURE && !completelyBurntOutCells.has(1)) {
    tempCell2 += temperatureRise; 
    totalHeatEnergyGenerated += powerGenerated * TIME_STEP;
  }

  // CELL 3: conduction flow form 2
  var conductionRate2to3 = isBarrierBlockingGap2 ? (cond_val * 0.002) : NORMAL_CONDUCTION;
  tempCell3 += conductionRate2to3 * (tempCell2 - tempCell3); 
  
  if (tempCell3 >= CRITICAL_TEMPERATURE && !completelyBurntOutCells.has(2)) {
    tempCell3 += temperatureRise;
    totalHeatEnergyGenerated += powerGenerated * TIME_STEP;
  }

  arrowCell1to2.style.opacity = (tempCell1 >= CRITICAL_TEMPERATURE && !hasBarrierDropped) ? 1 : 0;
  arrowCell2to3.style.opacity = (tempCell2 >= CRITICAL_TEMPERATURE && !hasBarrierDropped) ? 1 : 0;

  var totalDeltaTSoFar = Math.max(0, tempCell1 - currentInitialTemp);
  var totalEnergyQ     = currentCellMass * currentCellSpecificHeat * totalDeltaTSoFar;
  
  panel_live_equations.innerHTML = '<div style="font-weight: bold; font-size: 1.1rem; color: #2c3e50; margin-bottom: 5px;">Formula: Q = m * c * ΔT</div><div>Live: Q<sub>gen</sub> = (Mass: ' + currentCellMass + 'kg) * (c: ' + currentCellSpecificHeat + ') * (ΔT: +' + totalDeltaTSoFar.toFixed(1) + '°C) = ' + Math.round(totalEnergyQ) + ' J</div><div style="margin-top: 3px; color: #555;">Time Elapsed: ' + activeFaultTimer.toFixed(1) + 's | Total Energy Released: ' + (totalHeatEnergyGenerated / 1000).toFixed(2) + ' kJ</div>';
  
  panel_live_temperatures.innerText = 'Cell 1: ' + tempCell1.toFixed(1) + '°C   |   Cell 2: ' + tempCell2.toFixed(1) + '°C   |   Cell 3: ' + tempCell3.toFixed(1) + '°C';

  if (completelyBurntOutCells.size > 0) {
    var warningList = [];
    completelyBurntOutCells.forEach(function(cellIndex) {
      warningList.push('Cell ' + (cellIndex+1) + ': ' + Math.round(peakCellTemperatures[cellIndex]) + '°C (damaged)');
    });
    panel_live_damaged.innerText = 'Damaged: ' + warningList.join('   |   ');
    panel_live_damaged.style.display = 'block';
  } else {
    panel_live_damaged.innerText = '';
    panel_live_damaged.style.display = 'none';
  }

  var currentHottestTemp = Math.max(tempCell1, tempCell2, tempCell3);
  if (currentHottestTemp >= CRITICAL_TEMPERATURE && !hasBarrierDropped && !didBarrierButtonAppear && checkAutoIso.checked) {
    didBarrierButtonAppear = true;
    emergency_deploy_btn_manual.style.display = 'block'; 
  }

  var baselineCoolingSpeed = (currentCoolingEff / 100) * 0.9;
  var finalCoolingSpeed = baselineCoolingSpeed * (1 + cond_val * 0.05);
  
  var isGoodConductor = (mat_name === 'Aluminum' || mat_name === 'Steel');
  var isCoolingActive = (hasBarrierDropped && !isGoodConductor) || 
                        (activeFaultTimer > currentFaultDuration && Math.max(tempCell1, tempCell2, tempCell3) < CRITICAL_TEMPERATURE);
  
  if (isCoolingActive) {
    var coolingRateToUse = hasBarrierDropped ? finalCoolingSpeed : baselineCoolingSpeed;
    if (tempCell1 > currentInitialTemp) {
      tempCell1 -= (tempCell1 - currentInitialTemp) * coolingRateToUse * TIME_STEP;
      if (tempCell1 <= currentInitialTemp + 0.5) tempCell1 = currentInitialTemp;
    }
    if (tempCell2 > currentInitialTemp) {
      tempCell2 -= (tempCell2 - currentInitialTemp) * coolingRateToUse * TIME_STEP;
      if (tempCell2 <= currentInitialTemp + 0.5) tempCell2 = currentInitialTemp;
    }
    if (tempCell3 > currentInitialTemp) {
      tempCell3 -= (tempCell3 - currentInitialTemp) * coolingRateToUse * TIME_STEP;
      if (tempCell3 <= currentInitialTemp + 0.5) tempCell3 = currentInitialTemp;
    }
  }

  if (hasBarrierDropped && isGoodConductor) {
    if (!didShowConductorWarning) {
      didShowConductorWarning = true;
      var warningToast = document.getElementById('toastWarnBridge');
      var warnBarrierName = document.getElementById('txtWarnBarrierName');
      if (warningToast && warnBarrierName) {
        warnBarrierName.innerText = mat_name;
        warningToast.style.display = 'block';
        warningToast.classList.add('activeWarn');
      }
    }
  }

  var eventLogText = document.getElementById('system_event_log_line');
  if (eventLogText) {
    if (completelyBurntOutCells.size > 0) {
      eventLogText.innerText = '[ALERT] Unmitigated runaway has compromised cell structural integrity. Carbonization state triggered...';
    } else if (hasBarrierDropped) {
      if (isGoodConductor) {
        eventLogText.innerText = '[WARNING] Conductive barrier (' + mat_name + ') inserted at gap ' + (currentlyDeployedGapIndex + 1) + '. Heat bridge created! Runaway propagation continuing...';
      } else {
        eventLogText.innerText = '[CONTAINMENT DETECTED] Isolation barrier inserted at gap ' + (currentlyDeployedGapIndex + 1) + '. Conduction pathway severed. Cooling circulation engaged...';
      }
    } else if (tempCell1 >= CRITICAL_TEMPERATURE) {
      eventLogText.innerText = '[CRITICAL ALERT] Cell 1 temperature has exceeded safety bounds. Containment systems primed...';
    } else if (activeFaultTimer <= currentFaultDuration && tempCell1 > currentInitialTemp) {
      eventLogText.innerText = 'Cell 1 experiencing internal localized short-circuit. Rapid thermal generation Q_gen building up...';
    } else {
      eventLogText.innerText = 'System stable. Monitoring thermal levels...';
    }
  }

  currentCellTemperatures = [
    Math.max(currentInitialTemp, tempCell1), 
    Math.max(currentInitialTemp, tempCell2), 
    Math.max(currentInitialTemp, tempCell3)
  ];
  
  drawGrid();

  if (Math.round(activeFaultTimer * 10) % 20 === 0) {
    console.log("[DEBUG LOG] Elapsed: " + activeFaultTimer.toFixed(1) + "s. Temps: C1=" + tempCell1.toFixed(0) + "C, C2=" + tempCell2.toFixed(0) + "C, C3=" + tempCell3.toFixed(0) + "C");
  }

  var areAllCellsDestroyed = (completelyBurntOutCells.size === 3);
  var areAllSurvivingCellsCooled = true;
  for (var i = 0; i < 3; i++) {
    var isBurnt = completelyBurntOutCells.has(i);
    var isCooled = currentCellTemperatures[i] <= currentInitialTemp + 2;
    if (!isBurnt && !isCooled) {
      areAllSurvivingCellsCooled = false; 
    }
  }

  var isFaultOverAndSafe = (activeFaultTimer > currentFaultDuration) && areAllSurvivingCellsCooled;

  if (areAllCellsDestroyed || isFaultOverAndSafe) {
    clearInterval(mainSimInterval);
    isMainSimActive      = false;
    didBarrierButtonAppear = false;
    triggerBtn.disabled   = false;
    emergency_deploy_btn_manual.style.display = 'none';
    console.log("[DEBUG LOG] Physics simulation finished. System settled.");
  }
}

// physical barrier droped
function barrierDrop(triggerType, gapIdx) {
  hasBarrierDropped = true;
  
  if (gapIdx !== undefined) {
    currentlyDeployedGapIndex = gapIdx;
  } else {
    currentlyDeployedGapIndex = 0;
  }
  
  barrierPhysicalBox.classList.add('dropped');
  txt_response_time.innerText = activeFaultTimer.toFixed(2) + 's\n' + triggerType;
  console.log("[DEBUG LOG] Physical barrier dropped in gap " + (currentlyDeployedGapIndex + 1) + " due to: " + triggerType);
}

function show_inh_vals() {
  var inheritedMaterialName = document.getElementById('txt_inherited_material');
  var inheritedSpecificHeat = document.getElementById('txt_inherited_c');
  
  if (inheritedMaterialName) {
    inheritedMaterialName.innerText = mat_name;
  }
  if (inheritedSpecificHeat) {
    inheritedSpecificHeat.innerText  = sp_heat + ' J/kg°C';
  }
}

// reset stats
function resetMathStats() {
  currentCellTemperatures = [currentInitialTemp, currentInitialTemp, currentInitialTemp];
  peakCellTemperatures    = [currentInitialTemp, currentInitialTemp, currentInitialTemp];
  highestTempReached      = currentInitialTemp;
  
  damagedCellsSet.clear();
  totalDamagedCells = 0;
  timeOfFirstBreach = null;
  timeOfFullCooling = null;
  completelyBurntOutCells.clear();
  
  emergency_deploy_btn_manual.style.display = 'none';
  txt_peak_temp.innerText   = currentInitialTemp + '°C';
  txt_damaged_count.innerText = '0';
  totalHeatEnergyGenerated = 0;
  
  panel_live_equations.innerHTML = '<div style="font-weight: bold; font-size: 1.1rem; color: #2c3e50; margin-bottom: 5px;">Formula: Q = m * c * ΔT</div><div>Live: Q<sub>gen</sub> = (Mass: ' + currentCellMass + 'kg) * (c: ' + currentCellSpecificHeat + ') * (ΔT: +0.0°C) = 0 J</div><div style="margin-top: 3px; color: #555;">Time Elapsed: 0.0s | Total Energy Released: 0.00 kJ</div>';
  panel_live_temperatures.innerText  = 'Cell 1: ' + currentInitialTemp.toFixed(1) + '°C   |   Cell 2: ' + currentInitialTemp.toFixed(1) + '°C   |   Cell 3: ' + currentInitialTemp.toFixed(1) + '°C';
  
  panel_live_damaged.innerText = '';
  panel_live_damaged.style.display = 'none';
  
  didShowConductorWarning = false;
  var warningToast = document.getElementById('toastWarnBridge');
  if (warningToast) {
    warningToast.style.display = 'none';
    warningToast.classList.remove('activeWarn');
  }
  
  var eventLogText = document.getElementById('system_event_log_line');
  if (eventLogText) {
    eventLogText.innerText = 'System initialized. Awaiting fault trigger...';
  }
  
  drawGrid();
}

function resetSimNow() {
  clearInterval(mainSimInterval);
  isMainSimActive         = false;
  hasBarrierDropped       = false;
  didBarrierButtonAppear  = false;
  triggerBtn.disabled  = false;
  
  barrierPhysicalBox.classList.remove('dropped');
  arrowCell1to2.style.opacity  = 0;
  arrowCell2to3.style.opacity  = 0;
  txt_response_time.innerText = '-';
  emergency_deploy_btn_manual.style.display = 'none';
  
  currentlyDeployedGapIndex = 0;
  document.getElementById('cellGap1').appendChild(barrierPhysicalBox);

  initial_temperature_input.value  = 35;
  coolingSlider.value      = 50;
  durationInputBox.value     = 7;
  slider_mass_value.value         = 0.5;
  checkAutoIso.checked    = true;

  badge_initial_temp.innerText = '35°C';
  badge_cooling_value.innerText     = '50%';
  badge_duration_value.innerText    = '7s';
  badge_mass_value.innerText        = '0.5 kg';

  currentInitialTemp       = 35;
  currentCoolingEff        = 50;
  currentFaultDuration     = 7;
  currentCellMass          = 0.5;
  
  currentCellSpecificHeat  = sp_heat;
  currentThermalCapacity   = currentCellMass * currentCellSpecificHeat;

  resetMathStats();
  console.log("[DEBUG LOG] Simulation reset completed. Inputs set to default.");
}

resetMathStats();

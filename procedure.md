## **EXPERIMENT 1** 

## **Thermal Runaway Propagation & Emergency Battery Isolation Systems** 

## **Milestone 1: Isolation Barrier Material Selection** 

1. Open Simulation Workspace: Launch the simulator platform and locate the Material Testing Rig panel. 

2. Review Material Properties: Cycle through the barrier options (Aluminium, Steel, Air Gap, Aerogel) in the drop-down menu and inspect their native Thermal Conductivity (k) ratings. 

3. Execute Thermal Test: Click Run Thermal Test to watch the **Live Test Monitor** animate heat transfer from the 120 °C fault cell to the 25 °C normal cell. 

4. Lock In Selection: Compare the Time to Critical Temp (80 °C) and the Verdict to find the best insulator. Select it in the final menu and click Proceed to Milestone 2. 

## **Milestone 2: Multi-Variable Containment Simulation** 

1. Configure Testing Conditions: Verify your read-only inherited material choices. Use the parameter sliders to dial in your run variables within their allowed limits: 

   - Mass of Cell (m): 0.1 kg - 3.0 kg 

   - Initial Battery Temp: 20 °C – 60 °C 

   - Cooling Efficiency: 40% - 95% 

   - Fault Duration: 1 sec – 20 sec 

2. Select Control Mode: Set the Emergency Isolation System switch to **ON** for automated protection loops, or leave it **OFF** to test your own manual reflex times. 

3. Initiate Short Circuit: Click Trigger Fault to create an internal short circuit in Cell 1- **Fault Source** . 

4. Monitor Real-Time Data: Watch the Live Math Dashboard banner and live colour changes across Cells 1, 2, and 3 to track the calculation of **Live Heat Generation (** 𝑸= 𝒎∙𝒄∙∆𝑻 **)** , **Time Elapsed, and Energy Released.** 

5. Deploy Isolation Barrier: If running in manual mode **- System toggled OFF,** wait for the cell to hit the critical activation line (80 °C), then immediately mash the _**DEPLOY EMERGENCY BARRIER**_ button. Watch the barrier animate into the gap to block the conductive heat highway. 

6. Check Damaged Cells: If mitigation is too slow and a cell cooks past 120 °C, observe it turn flat black indicating carbonized burnout. 

7. Log Final Telemetry: Review final performance metrics - **Peak Temp, Response Time, Damaged Cells.** Click the History button to record your **Total Damaged Cells, First Breach Timestamp, and Cooling Recovery Duration fields.** 

8. Review Event Logs & Reset: Read the Dynamic Event Log box below the fold for a step-by-step thermodynamic explanation of the run. Click **Reset Simulation** to adjust variables and rerun the trial. 


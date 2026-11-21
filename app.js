(() => {
  /* ==========================================================================
     1. WEB AUDIO SYNTHESIZER (DIAGNOSTIC BEEPS, TONER, RELAYS, ALERTS)
     ========================================================================== */
  let sfxEnabled = true;
  let audioCtx = null;

  function playTone(type) {
    if (!sfxEnabled) return;
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === "suspended") audioCtx.resume();
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === "click") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(640, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.045);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
        osc.start(now); osc.stop(now + 0.05);
      } else if (type === "good") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(587.33, now);
        osc.frequency.setValueAtTime(880, now + 0.08);
        gain.gain.setValueAtTime(0.11, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
        osc.start(now); osc.stop(now + 0.25);
      } else if (type === "toner") {
        osc.type = "square";
        osc.frequency.setValueAtTime(980, now);
        osc.frequency.setValueAtTime(1320, now + 0.09);
        osc.frequency.setValueAtTime(980, now + 0.18);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        osc.start(now); osc.stop(now + 0.29);
      } else if (type === "bad") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(190, now);
        osc.frequency.linearRampToValueAtTime(130, now + 0.22);
        gain.gain.setValueAtTime(0.11, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.23);
        osc.start(now); osc.stop(now + 0.24);
      } else if (type === "cert") {
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
          const o = audioCtx.createOscillator();
          const g = audioCtx.createGain();
          o.type = "triangle";
          o.frequency.setValueAtTime(freq, now + idx * 0.075);
          g.gain.setValueAtTime(0.1, now + idx * 0.075);
          g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.075 + 0.25);
          o.connect(g); g.connect(audioCtx.destination);
          o.start(now + idx * 0.075); o.stop(now + idx * 0.075 + 0.26);
        });
      }
    } catch {}
  }

  /* ==========================================================================
     2. PHOTOREALISTIC SVG DEFS (PCB TRACES, METALS, LED GLOWS, RACK SCREWS)
     ========================================================================== */
  const SVG_DEFS = `
    <defs>
      <linearGradient id="brushedMetal" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#2c3942"/>
        <stop offset="50%" stop-color="#1c262d"/>
        <stop offset="100%" stop-color="#131b20"/>
      </linearGradient>
      <linearGradient id="chassisSteel" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#242e35"/>
        <stop offset="100%" stop-color="#12181d"/>
      </linearGradient>
      <linearGradient id="pcbGreen" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#132c28"/>
        <stop offset="50%" stop-color="#0e221f"/>
        <stop offset="100%" stop-color="#091715"/>
      </linearGradient>
      <linearGradient id="pcbDark" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#162129"/>
        <stop offset="100%" stop-color="#0d1419"/>
      </linearGradient>
      <linearGradient id="goldPin" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#ffe08a"/>
        <stop offset="100%" stop-color="#b88728"/>
      </linearGradient>
      <linearGradient id="copperHeat" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#b56542"/>
        <stop offset="50%" stop-color="#e3946c"/>
        <stop offset="100%" stop-color="#8c482b"/>
      </linearGradient>
      <pattern id="pcbTraces" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 0 10 L 15 10 L 22 17 L 40 17 M 10 0 L 10 25 L 18 33 L 18 40 M 28 0 L 28 12 L 35 19 L 40 19" fill="none" stroke="#1e423c" stroke-width="1.1"/>
        <circle cx="15" cy="10" r="1.6" fill="#25544c"/>
        <circle cx="28" cy="12" r="1.6" fill="#25544c"/>
      </pattern>
      <filter id="ledGlow" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="2.8" result="blur"/>
        <feMerge>
          <feMergeNode in="blur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
  `;

  function rackScrew(x, y) {
    return `<g transform="translate(${x},${y})">
      <circle cx="0" cy="0" r="4.5" fill="#10161a" stroke="#536875" stroke-width="1"/>
      <line x1="-2.5" y1="-2.5" x2="2.5" y2="2.5" stroke="#6c8494" stroke-width="1"/>
      <line x1="2.5" y1="-2.5" x2="-2.5" y2="2.5" stroke="#6c8494" stroke-width="1"/>
    </g>`;
  }

  /* ==========================================================================
     3. PERSISTENT TELEMETRY (20 SCENARIOS: 5 CERT TRACKS x 4 CERTIFICATION LEVELS)
     ========================================================================== */
  const STORAGE_KEY = "it_av_photoreal_sim_v3";
  const defaultSave = { completed: [], mistakes: 0, actions: 0, examBest: null, tierStats: {} };

  let saveData = (() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      return {
        ...defaultSave,
        ...parsed,
        completed: Array.isArray(parsed.completed) ? parsed.completed.filter(k => /^[a-z]+_[1-4]$/.test(k)) : [],
        mistakes: Number.isFinite(parsed.mistakes) ? Math.max(0, parsed.mistakes) : 0,
        actions: Number.isFinite(parsed.actions) ? Math.max(0, parsed.actions) : 0,
        tierStats: parsed.tierStats && typeof parsed.tierStats === "object" ? parsed.tierStats : {}
      };
    } catch {
      return { ...defaultSave };
    }
  })();

  function persist() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData)); } catch {}
    updateHUD();
  }

  function showToast(msg) {
    const el = document.getElementById("toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove("show"), 3800);
  }

  const PASS_THRESHOLD = 80;
  function tierAccuracy(key) {
    const stat = saveData.tierStats?.[key] || { correct: 0, attempts: 0 };
    return stat.attempts ? Math.round((stat.correct / stat.attempts) * 100) : 0;
  }

  function recordAction(isCorrect, scenarioKey = null) {
    saveData.actions++;
    if (!isCorrect) { saveData.mistakes++; playTone("bad"); }
    else if (!scenarioKey) { playTone("good"); }

    const activeKey = currentView in activeTier ? `${currentView}_${activeTier[currentView]}` : null;
    if (activeKey) {
      const stat = saveData.tierStats[activeKey] || { correct: 0, attempts: 0 };
      stat.attempts++;
      if (isCorrect) stat.correct++;
      saveData.tierStats[activeKey] = stat;
    }

    if (scenarioKey && !saveData.completed.includes(scenarioKey)) {
      const accuracy = tierAccuracy(scenarioKey);
      if (accuracy >= PASS_THRESHOLD) {
        saveData.completed.push(scenarioKey);
        playTone("cert");
        const [bench, lvl] = scenarioKey.split("_");
        showToast(`Certified (${accuracy}% precision)! ${bench.toUpperCase()} — MODULE ${lvl} cleared!`);
      } else {
        playTone("bad");
        showToast(`Fault resolved, but precision is ${accuracy}% (${PASS_THRESHOLD}% required). Reset module or verify cleanly to pass.`);
      }
    }
    persist();
  }

  function updateHUD() {
    document.getElementById("hud-cases").textContent = `${saveData.completed.length}/20`;
    const eff = saveData.actions === 0
      ? 100
      : Math.max(0, Math.round(((saveData.actions - saveData.mistakes) / saveData.actions) * 100));
    document.getElementById("hud-score").textContent = `${eff}%`;
    document.getElementById("hud-flags").textContent = saveData.mistakes;

    ["pc", "network", "dante", "av", "qs"].forEach(id => {
      const tag = document.getElementById(`tag-${id}`);
      if (!tag) return;
      const count = [1, 2, 3, 4].filter(l => saveData.completed.includes(`${id}_${l}`)).length;
      tag.textContent = count === 4 ? "CERTIFIED" : `${count}/4`;
      tag.classList.toggle("done", count === 4);
    });
  }

  /* ==========================================================================
     4. ACTIVE NAVIGATION, 4-LEVEL DOMAIN DEFINITIONS & 20 SCENARIO STATES
     ========================================================================== */
  let currentView = "overview";
  let selectedTool = null;
  const activeTier = { pc: 1, network: 1, dante: 1, av: 1, qs: 1 };

  const tierLabels = {
    pc: [
      { tag: "220-1201 • HARDWARE", name: "L1: No-POST & DDR5" },
      { tag: "220-1201 • THERMAL", name: "L2: AIO & VRM Cooling" },
      { tag: "220-1201 • POWER/PCIe", name: "L3: +12V Rail & NVMe" },
      { tag: "220-1202 • SECURITY/OS", name: "L4: TPM 2.0 & BitLocker" }
    ],
    network: [
      { tag: "N10-009 • LAYER 1/2", name: "L1: Toning & Access VLAN" },
      { tag: "N10-009 • SWITCHING", name: "L2: 802.1Q Trunk & Native" },
      { tag: "N10-009 • RESILIENCY", name: "L3: STP Loop & Port-Sec" },
      { tag: "N10-009 • ROUTING/WAN", name: "L4: OSPF & ACL Firewall" }
    ],
    dante: [
      { tag: "DANTE L1 • FUNDAMENTALS", name: "L1: Rate Sync & Matrix" },
      { tag: "DANTE L2 • CLOCKING", name: "L2: PTPv2 & 802.3az EEE" },
      { tag: "DANTE L2 • REDUNDANCY", name: "L3: Pri/Sec VLAN & IGMP" },
      { tag: "DANTE L3 • ENTERPRISE", name: "L4: DDM, AES67 & QoS DSCP" }
    ],
    av: [
      { tag: "AVIXA CTS • SIGNAL PATH", name: "L1: Source-to-Sink Chain" },
      { tag: "AVIXA CTS • TRANSPORT", name: "L2: HDBaseT & 10.2G EDID" },
      { tag: "AVIXA CTS • ENCRYPTION", name: "L3: HDCP 2.2→1.4 & Chroma" },
      { tag: "AVIXA CTS-D • ACOUSTICS", name: "L4: SPL, PAG/NAG & Throw" }
    ],
    qs: [
      { tag: "Q-SYS L1 • SIGNAL FLOW", name: "L1: Gain Staging & Mute" },
      { tag: "Q-SYS L1 • CONFERENCING", name: "L2: AEC Reference & NLP" },
      { tag: "Q-SYS L2 • AMPLIFIERS", name: "L3: 70V High-Z & Limiter" },
      { tag: "Q-SYS L2 • CONTROL/UCI", name: "L4: GPIO, UCI & Q-LAN PTP" }
    ]
  };

  const benchmarkDetails = {
    pc: [
      { focus: "Core 1 Hardware: No-POST & DDR5 Dual-Channel Diagnostics", standard: "Bond ESD strap to bare steel, measure ATX PSU rails, decode Q-Code 55, latch DDR5 DIMM B2, and verify POST A0." },
      { focus: "Core 1 Thermal Management: AIO Pump, Airflow & TIM Remediation", standard: "Bond ESD strap, read HWMonitor pump/temp sensors, clear choked intake mesh, clean dried paste with 99% IPA, and mount coldplate." },
      { focus: "Core 1 Power & Storage: +12V Rail Droop & PCIe 4.0 NVMe Forensics", standard: "Bond ESD strap, probe +12V rail droop under load, swap modular PSU rail, install M.2 thermal pad, reseat NVMe, and verify UEFI." },
      { focus: "Core 2 OS & Hardware Security: TPM 2.0, Secure Boot & BitLocker Recovery", standard: "Bond ESD strap, reseat 14-pin SPI dTPM 2.0 module, enable UEFI Secure Boot + TPM 2.0, and enter 48-digit BitLocker recovery key." }
    ],
    network: [
      { focus: "Layer 1 & Switching: Inductive Toning, Patching & Access VLAN", standard: "Tone Wall Drop D-14 to PP-07, patch Cat6 to Gi0/7, inspect switch CLI, reassign from VLAN 999 to VLAN 10, and ping gateway." },
      { focus: "802.1Q Trunking: Allowed VLAN List & Native VLAN Alignment", standard: "Inspect trunk Te1/1 via serial console, add VLAN 20 to allowed list, align Native VLAN 99, and verify VLAN 20 gateway reachability." },
      { focus: "Layer 2 Resiliency: Spanning Tree Broadcast Storm & Err-Disabled Recovery", standard: "Inspect STP diagnostics, apply BPDU Guard on rogue loop port Gi0/12, bounce err-disabled port Gi0/4, and verify 0% packet loss." },
      { focus: "Layer 3 Routing & Security: OSPF Area Mismatch & Extended ACL Remediation", standard: "Inspect OSPF neighbor adjacency stuck in INIT/EXSTART, align Area 0, permit TCP 443 in inbound Extended ACL, and verify WAN ping." }
    ],
    dante: [
      { focus: "Dante Level 1: Sample Rate Alignment & Matrix Subscriptions", standard: "Align Transmitter and Receiver to 48 kHz / 24-bit and subscribe TX 01 & TX 02 to RX 01 & RX 02." },
      { focus: "Dante Level 2: IEEE 802.3az EEE Elimination & PTPv2 Leader Election", standard: "Disable 802.3az Energy Efficient Ethernet on managed switch, assign DSP-CORE-01 as Preferred Leader with External Sync OFF, and verify lock." },
      { focus: "Dante Level 2/3: Primary/Secondary VLAN Isolation & IGMP Snooping", standard: "Separate bridged Primary/Secondary networks into isolated VLANs, enable IGMP Snooping + Querier, and optimize multicast flows." },
      { focus: "Dante Level 3 Enterprise: Dante Domain Manager, AES67 Interop & DSCP QoS", standard: "Enroll devices into DDM Auditorium Domain, enable AES67 SAP/239.69.x.x interoperability at 48 kHz, and map DSCP EF (46) strict priority." }
    ],
    av: [
      { focus: "AVIXA CTS Signal Flow: Source-to-Sink Physical & Input Verification", standard: "Seat loose table box HDMI pigtail, switch commercial display input from HDMI 2 to HDMI 1, and verify 1080p60 sync." },
      { focus: "AVIXA CTS Transport: Shielded Cat6A F/UTP & 10.2 Gbps HDBaseT EDID", standard: "Certify HDBaseT run, replace unshielded UTP with Shielded Cat6A, constrain EDID from 17.82 Gbps to 4K60 4:2:0 (10.2 Gbps), and verify." },
      { focus: "AVIXA CTS Encryption: HDCP 2.2 → 1.4 Down-Conversion & Color Space", standard: "Probe HDCP/chroma mismatch, configure scaling matrix for HDCP 1.4 down-conversion and YCbCr 4:2:2 8-bit, and verify projector lock." },
      { focus: "AVIXA CTS-D Design: Inverse Square Law SPL, PAG/NAG & Throw Ratio", standard: "Verify Inverse Square Law SPL (76 dB at 8m from 88 dB at 2m), confirm PAG ≥ NAG feedback stability, and calibrate 1.5:1 projector throw ratio." }
    ],
    qs: [
      { focus: "Q-SYS Level 1: Gain Staging, Logic Mute & Amplifier Telemetry", standard: "Stage Mic In 1 preamp into +3..+9 dB (-12 dBFS nominal), clear stuck Output Mute block, and verify CX-Q amplifier output." },
      { focus: "Q-SYS Level 1/2: Acoustic Echo Cancellation (AEC) Reference & NLP", standard: "Wire Far-End VoIP RX Out pin into AEC Reference input pin, configure NLP to Medium, and verify Echo Return Loss (ERL)." },
      { focus: "Q-SYS Level 2: 70V High-Z Distributed Audio & Over-Current Protection", standard: "Lower clipping preamp gain, engage +4 dBu Peak Limiter, switch CX-Q Ch 1 from Low-Z 4Ω to 70V High-Z + 80Hz HPF, and verify load." },
      { focus: "Q-SYS Level 2 Control: GPIO Fire-Alarm Mute, UCI & Q-LAN PTPv2 Sync", standard: "Wire Normally-Closed (NC) Fire Alarm GPIO relay to Emergency Mute snapshot, deploy Room UCI, and verify Q-LAN PTPv2 audio clock lock." }
    ]
  };

  // --- SCENARIO STATES ---
  const pc1 = { esdAttached: false, psuChecked: false, postRead: false, ramReseated: false, bootVerified: false, mentorTone: "", mentorText: "Lead Tech (220-1201): Workstation WS-CAD-09 powers on with spinning fans but shows No Signal. Bond your ESD Wrist Strap to bare chassis metal first, probe ATX PSU rails, decode Q-Code 55, and latch DDR5 DIMM B2.", lastReading: "POST LED: 55 (Memory Initialization Failure) | +12V Rail: Standby" };
  const pc2 = { esdAttached: false, telemetryRead: false, filterCleaned: false, pasteCleaned: false, pasteApplied: false, coolerMounted: false, mentorTone: "", mentorText: "Lead Tech (220-1201): CAD workstation thermally shuts down after 4 minutes under render load. Ground chassis, inspect pump/thermal telemetry, vacuum choked front dust mesh, strip dried TIM with 99% IPA, and remount the AIO coldplate.", lastReading: "CPU PKG: 102°C (TJMAX THROTTLE!) | AIO PUMP: 2850 RPM | INTAKE FLOW: 14%" };
  const pc3 = { esdAttached: false, railsProbed: false, railSwapped: false, padFixed: false, nvmeReseated: false, biosVerified: false, mentorTone: "", mentorText: "Lead Tech (220-1201): Render node throws WHEA_UNCORRECTABLE_ERROR BSODs and drops its NVMe drive under GPU load. Ground chassis, measure +12V droop with Load Multimeter, swap to modular PSU Rail B, bridge missing M.2 thermal pad, and reseat NVMe.", lastReading: "+12V RAIL A LOAD: 11.18V (ATX SPEC FAIL <11.40V!) | M.2 CONTROLLER: 84°C" };
  const pc4 = { esdAttached: false, tpmReseated: false, biosConfigured: false, bitlockerUnlocked: false, secureBoot: "DISABLED", tpmState: "OFF", mentorTone: "", mentorText: "Lead Tech (220-1202 Security): After a motherboard replacement, Windows 11 Pro halts at a blue BitLocker Recovery screen and fails TPM checks. Ground chassis, reseat the 14-pin SPI dTPM 2.0 module, enable Secure Boot + TPM 2.0 in UEFI, and unlock BitLocker.", lastReading: "TPM 2.0: NOT DETECTED | SECURE BOOT: OFF | OS VOLUME C: BITLOCKER LOCKED" };

  const net1 = { dropTraced: false, patchedPort7: false, pendingPatchFrom: null, cliInspected: false, vlanFixed: false, pingVerified: false, selectedVlan: "999", mentorTone: "", mentorText: "NetOps Lead (N10-009): Wall Drop D-14 pulls an APIPA 169.254.x.x IP. Use the Fluke Toner/Probe on Wall Drop D-14 first to locate its patch panel port.", cliLog: "SW-IDF-02> awaiting serial console connection (9600 8N1)..." };
  const net2 = { cliInspected: false, allowedFixed: false, nativeFixed: false, dhcpVerified: false, allowedVal: "10,99", nativeVal: "1", mentorTone: "", mentorText: "NetOps Lead (N10-009): AV endpoints on VLAN 20 cannot reach gateway 10.20.0.1 over 802.1Q uplink trunk Te1/1. Connect RJ45 Console to SW-01 and inspect `show interfaces trunk`.", cliLog: "SW-IDF-02> connect console cable to inspect trunk Te1/1..." };
  const net3 = { stpInspected: false, bpduGuardEnabled: false, portCleared: false, pingVerified: false, mentorTone: "", mentorText: "NetOps Lead (N10-009): Switch CPU is pinned at 99% from a Layer 2 broadcast storm on Gi0/12, and conference port Gi0/4 is stuck `err-disabled`. Inspect Spanning Tree CLI first.", cliLog: "SW-IDF-02> SYSLOG: %SPANTREE-2-LOOP_DETECTED / %PM-4-ERR_DISABLE on Gi0/4..." };
  const net4 = { ospfInspected: false, ospfFixed: false, aclFixed: false, wanVerified: false, ospfArea: "10", aclRule: "DENY_443", mentorTone: "", mentorText: "NetOps Lead (N10-009): Branch router R1 cannot form an OSPF adjacency with Core R0 (stuck in INIT/EXSTART due to Area 10 vs Area 0 mismatch), and an inbound Extended ACL blocks HTTPS (TCP 443). Inspect R1 CLI first.", cliLog: "R1-BRANCH# awaiting console connection..." };

  const dante1 = { sampleRateSynced: false, routedCh1: false, routedCh2: false, txRate: "96", rxRate: "48", mentorTone: "", mentorText: "Audio Eng (Level 1): Stagebox microphones show green link in Dante Controller, but zero audio reaches DSP-CORE-01 due to a sample-rate mismatch. Align both devices to 48 kHz and subscribe TX 01 & TX 02 to RX 01 & RX 02." };
  const dante2 = { eeeDisabled: false, leaderSet: false, clockVerified: false, preferredLeader: "NONE", extSync: "ON", mentorTone: "", mentorText: "Audio Eng (Level 2): Live auditorium audio clicks every 30 seconds and PTPv2 clock leader election flaps. Disable IEEE 802.3az Energy Efficient Ethernet (EEE) on SW-AV-01 and lock DSP-CORE-01 as Preferred Leader with External Sync OFF." };
  const dante3 = { vlansIsolated: false, igmpEnabled: false, flowModeFixed: false, verifiedZeroDrop: false, mentorTone: "", mentorText: "Audio Eng (Level 2/3): 64-channel Dante network has 1,420 late packets/sec and ARP storms. Primary and Secondary ports are bridged onto VLAN 1, and unmanaged multicast floods non-Dante ports. Isolate VLANs, enable IGMP Snooping + Querier, and optimize flows." };
  const dante4 = { ddmEnrolled: false, aes67Enabled: false, qosMapped: false, verifiedEnterprise: false, ddmDomain: "UNMANAGED", aes67Mode: "OFF", qosProfile: "BEST_EFFORT", mentorTone: "", mentorText: "Audio Eng (Level 3 Enterprise): Multi-subnet broadcast facility requires Dante Domain Manager (DDM) enrollment across Layer 3 subnets, AES67 interoperability (239.69.x.x / 48 kHz), and DiffServ DSCP EF (46) strict priority QoS." };

  const av1 = { cableSeated: false, inputSwitched: false, signalVerified: false, mentorTone: "", mentorText: "CTS Field Eng (Level 1): Presenter connected a laptop at the conference table box, but the display shows 'No Signal'. Seat the loose HDMI pigtail at the table plate and switch the display from HDMI 2 to HDMI 1." };
  const av2 = { cableTested: false, cableShielded: false, edidAnalyzed: false, edidFixed: false, sinkVerified: false, edidMode: "4K60_444", mentorTone: "", mentorText: "CTS Field Eng (Level 2): Boardroom 4K display sparkles and drops sync at 4K60. Certify the 45m HDBaseT Cat6A link for shielding/ANEXT, install Shielded Cat6A F/UTP, and constrain Matrix EDID from 17.82 Gbps to 4K60 4:2:0 (10.2 Gbps)." };
  const av3 = { hdcpAnalyzed: false, hdcpDowngraded: false, colorSpaceSet: false, sinkVerified: false, hdcpMode: "PASS_22", colorMode: "RGB_10BIT", mentorTone: "", mentorText: "CTS Field Eng (Level 3): Laptop desktop displays cleanly, but protected 4K streaming video turns the legacy projector bright green with 'HDCP Unauthorized'. Configure Scaling Matrix for HDCP 2.2→1.4 down-conversion and YCbCr 4:2:2 8-bit." };
  const av4 = { splCalculated: false, pagVerified: false, throwCalibrated: false, designSignedOff: false, splAnswer: "82", pagMargin: "FAIL_LOOP", throwRatio: "0.8", mentorTone: "", mentorText: "CTS-D Design Eng (Level 4): Verify three AV design parameters: (1) Inverse Square Law SPL at 8m given 88 dB SPL at 2m, (2) Potential Acoustic Gain (PAG ≥ NAG) stability, and (3) Lens Throw Ratio for a 3.0m wide screen at 4.5m throw distance." };

  const qs1 = { gainStaged: false, ampVerified: false, micGain: -18, logicMuted: true, mentorTone: "", mentorText: "Q-SYS Eng (Level 1): Ceiling mic input meter reads weak (-34 dBFS) and room speakers are silent. Stage Mic Gain into the nominal +3 to +9 dB green zone (-12 dBFS), clear the stuck Mute block, and verify the CX-Q amplifier." };
  const qs2 = { aecWired: false, pendingPin: null, erlTuned: false, duplexVerified: false, nlpLevel: "OFF", mentorTone: "", mentorText: "Q-SYS Eng (Level 1/2): Remote Zoom/Teams callers hear severe echo of their own voice. Wire the Far-End VoIP RX Out pin to the AEC Reference input pin, set NLP to Medium, and verify Echo Return Loss (ERL)." };
  const qs3 = { gainFixed: false, limiterEngaged: false, ampModeFixed: false, ampVerified: false, micGain: 24, limiterActive: false, ampMode: "LOW_Z_4OHM", mentorTone: "", mentorText: "Q-SYS Eng (Level 2): Auditorium CX-Q 4K4 amplifier trips into Over-Current Protect during loud speech. Calibrate clipping preamp (+24 dB → +6 dB), engage +4 dBu Peak Limiter, and switch Amp Ch 1 from Low-Z 4Ω to 70V High-Z + 80Hz HPF." };
  const qs4 = { gpioWired: false, pendingGpio: null, uciDeployed: false, ptpSynced: false, gpioLogic: "NO_FAULT", uciPage: "UNASSIGNED", mentorTone: "", mentorText: "Q-SYS Eng (Level 2 Enterprise): Life-safety inspection requires a fail-safe Normally-Closed (NC) Fire Alarm GPIO contact wired to the Emergency Mute snapshot, deployment of the Room Control UCI to the TSC-70 touch panel, and Q-LAN PTPv2 clock verification." };

  /* ==========================================================================
     5. DYNAMIC TOOL DOCKS PER BENCH & 4 CERTIFICATION LEVELS
     ========================================================================== */
  const toolsMatrix = {
    pc_1: [
      { id: "esd", icon: "⚡", name: "ESD Wrist Strap", sub: "Bond Chassis" },
      { id: "dmm", icon: "📟", name: "Fluke Multimeter", sub: "Measure Rails" },
      { id: "post", icon: "🔬", name: "POST LED Probe", sub: "Decode Q-Code" },
      { id: "hand", icon: "🧤", name: "Anti-Static Hand", sub: "Latch DIMM" },
      { id: "power", icon: "🔌", name: "Power / Display", sub: "Verify Boot" }
    ],
    pc_2: [
      { id: "esd", icon: "⚡", name: "ESD Wrist Strap", sub: "Bond Chassis" },
      { id: "thermal", icon: "🌡️", name: "HWMonitor Probe", sub: "Read Temps/RPM" },
      { id: "air", icon: "💨", name: "HEPA Vacuum/Air", sub: "Clean Dust Mesh" },
      { id: "iso", icon: "🧴", name: "99% Isopropyl", sub: "Strip Old TIM" },
      { id: "paste", icon: "🧪", name: "Thermal Compound", sub: "Apply & Mount" }
    ],
    pc_3: [
      { id: "esd", icon: "⚡", name: "ESD Wrist Strap", sub: "Bond Chassis" },
      { id: "dmm", icon: "📟", name: "Load Multimeter", sub: "Probe +12V Droop" },
      { id: "cable", icon: "🔌", name: "Modular PSU Rail", sub: "Swap Rail B" },
      { id: "pad", icon: "🧊", name: "M.2 Thermal Pad", sub: "Bridge Heatsink" },
      { id: "hand", icon: "🧤", name: "Anti-Static Hand", sub: "Reseat NVMe/BIOS" }
    ],
    pc_4: [
      { id: "esd", icon: "⚡", name: "ESD Wrist Strap", sub: "Bond Chassis" },
      { id: "hand", icon: "🧤", name: "Anti-Static Hand", sub: "Reseat dTPM 2.0" },
      { id: "uefi", icon: "🛡️", name: "UEFI Firmware Key", sub: "Secure Boot/TPM" },
      { id: "bitlocker", icon: "🔑", name: "BitLocker Key", sub: "48-Digit Unlock" }
    ],
    network_1: [
      { id: "toner", icon: "📡", name: "Fluke Toner/Probe", sub: "Trace Wall Drop" },
      { id: "patch", icon: "🔗", name: "Cat6 Patch Cord", sub: "Connect Ports" },
      { id: "console", icon: "💻", name: "RJ45 Console", sub: "Switch CLI" },
      { id: "ping", icon: "📶", name: "Net Tester/Ping", sub: "Verify Layer 3" }
    ],
    network_2: [
      { id: "console", icon: "💻", name: "RJ45 Console", sub: "Inspect Trunk" },
      { id: "cli", icon: "⌨️", name: "IOS Trunk Config", sub: "Apply VLAN/Native" },
      { id: "ping", icon: "📶", name: "DHCP/ICMP Tester", sub: "Verify Gateway" }
    ],
    network_3: [
      { id: "console", icon: "💻", name: "RJ45 Console", sub: "STP & Err-Disable" },
      { id: "bpdu", icon: "🛡️", name: "BPDU Guard Tool", sub: "Block Rogue Loop" },
      { id: "recover", icon: "🔄", name: "Port Bounce Tool", sub: "shut / no shut" },
      { id: "ping", icon: "📶", name: "Packet Analyzer", sub: "Verify 0% Loss" }
    ],
    network_4: [
      { id: "console", icon: "💻", name: "Router Console", sub: "Inspect OSPF/ACL" },
      { id: "ospf", icon: "🌐", name: "OSPF Area Tool", sub: "Align Area 0" },
      { id: "acl", icon: "🧱", name: "ACL Policy Editor", sub: "Permit TCP 443" },
      { id: "ping", icon: "📶", name: "WAN Probe", sub: "Verify End-to-End" }
    ],
    dante_1: [
      { id: "clock", icon: "⏱️", name: "Dante Clock/Rate", sub: "Sync 48 kHz" },
      { id: "route", icon: "🔀", name: "Dante Matrix Tool", sub: "Subscribe TX→RX" }
    ],
    dante_2: [
      { id: "switchui", icon: "⚙️", name: "Switch Config", sub: "Disable EEE" },
      { id: "clock", icon: "⏱️", name: "PTPv2 Clock Tool", sub: "Leader & Sync" }
    ],
    dante_3: [
      { id: "vlan", icon: "🧱", name: "VLAN Isolator", sub: "Split Pri/Sec" },
      { id: "igmp", icon: "📡", name: "IGMP Snooping", sub: "Enable Querier" },
      { id: "flow", icon: "🔀", name: "Flow Optimizer", sub: "Prune Multicast" }
    ],
    dante_4: [
      { id: "ddm", icon: "🏛️", name: "DDM Domain Tool", sub: "Enroll L3 Subnet" },
      { id: "aes67", icon: "🔄", name: "AES67 Bridge", sub: "Enable SAP/RTP" },
      { id: "qos", icon: "🚦", name: "DiffServ QoS Tool", sub: "Map DSCP EF 46" }
    ],
    av_1: [
      { id: "hand", icon: "🔌", name: "Cable / Input Tool", sub: "Seat HDMI/Input" },
      { id: "display", icon: "🖥️", name: "Sink Verifier", sub: "Confirm Signal" }
    ],
    av_2: [
      { id: "certifier", icon: "🧪", name: "Cat6A Certifier", sub: "Test Shield/ANEXT" },
      { id: "stp", icon: "🛡️", name: "Shielded Cat6A", sub: "Install F/UTP" },
      { id: "edid", icon: "📊", name: "EDID/TMDS Probe", sub: "Check Bandwidth" },
      { id: "display", icon: "🖥️", name: "Sink Verifier", sub: "Verify 4K60" }
    ],
    av_3: [
      { id: "hdcp", icon: "🔐", name: "HDCP/Color Probe", sub: "Inspect Handshake" },
      { id: "scaler", icon: "🎛️", name: "Scaler Config", sub: "HDCP 1.4 & 4:2:2" },
      { id: "display", icon: "🖥️", name: "Projector Lock", sub: "Verify Content" }
    ],
    av_4: [
      { id: "spl", icon: "📏", name: "SPL & Distance Meter", sub: "Verify Inverse Sq" },
      { id: "pag", icon: "🎤", name: "PAG / NAG Analyzer", sub: "Check Feedback Margin" },
      { id: "lens", icon: "📽️", name: "Throw Ratio Optics", sub: "Calibrate Lens" }
    ],
    qs_1: [
      { id: "meter", icon: "🎚️", name: "Gain / Trim Tool", sub: "Stage -12 dBFS" },
      { id: "logic", icon: "🔓", name: "Mute Override", sub: "Clear Mute" },
      { id: "amp", icon: "🔊", name: "Amp Telemetry", sub: "Verify Output" }
    ],
    qs_2: [
      { id: "wire", icon: "✏️", name: "Schematic Wire", sub: "Connect AEC Ref" },
      { id: "aec", icon: "🎙️", name: "AEC / NLP Tuner", sub: "Optimize ERL" }
    ],
    qs_3: [
      { id: "meter", icon: "🎚️", name: "Gain & Limiter", sub: "Fix Clipping" },
      { id: "ampcfg", icon: "⚡", name: "Amp Output Mode", sub: "Set 70V High-Z" },
      { id: "amp", icon: "🔊", name: "Amp Telemetry", sub: "Verify Impedance" }
    ],
    qs_4: [
      { id: "gpio", icon: "🚨", name: "GPIO Life-Safety Wire", sub: "Connect NC Relay" },
      { id: "uci", icon: "📱", name: "UCI Deployer", sub: "Push Touch UI" },
      { id: "ptp", icon: "⏱️", name: "Q-LAN PTP Verifier", sub: "Audit Sync Lock" }
    ]
  };

  function getActiveTools() {
    const key = `${currentView}_${activeTier[currentView] || 1}`;
    return toolsMatrix[key] || [];
  }

  /* ==========================================================================
     6. ENGINEERING REFERENCE GLOSSARY & 20-QUESTION MASTERY EXAM
     ========================================================================== */
  const glossaryTerms = [
    { term: "ESD (Electrostatic Discharge)", domain: "CompTIA A+ (220-1201)", def: "Sudden static discharge between charged objects. Always clip an ESD wrist strap (with 1 MΩ safety resistor) to unpainted chassis steel before handling internal components." },
    { term: "POST Q-Code 55 & A0", domain: "CompTIA A+ (220-1201)", def: "Hexadecimal diagnostic indicators on workstation motherboards: 55 signifies Memory Initialization Failure; A0 indicates storage initialization complete and OS boot hand-off." },
    { term: "Thermal Interface Material (TIM) & TjMax", domain: "CompTIA A+ (220-1201)", def: "Thermal paste fills microscopic air gaps between CPU IHS and cooler coldplate. Dried paste or choked airflow drives CPU junction temp to TjMax (~100°C), causing thermal throttling." },
    { term: "+12V Rail Droop & NVMe Thermal Pad", domain: "CompTIA A+ (220-1201)", def: "ATX12V spec requires +12V within ±5% (11.40V–12.60V). Droop below 11.4V or M.2 PCIe Gen4 controller overheating (>80°C) triggers WHEA_UNCORRECTABLE_ERROR BSODs." },
    { term: "TPM 2.0, UEFI Secure Boot & BitLocker", domain: "CompTIA A+ (220-1202)", def: "Trusted Platform Module 2.0 stores cryptographic keys measuring firmware integrity. Replacing a motherboard or toggling Secure Boot triggers BitLocker Recovery requiring the 48-digit recovery key." },
    { term: "Inductive Cable Toner & Probe", domain: "CompTIA Network+ (N10-009)", def: "Layer 1 diagnostic tool injecting an audio-modulated carrier onto twisted-pair copper so technicians can trace unlabeled wall drops back to patch panel ports." },
    { term: "802.1Q Trunk Allowed & Native VLAN", domain: "CompTIA Network+ (N10-009)", def: "Trunk ports tag multiple VLANs; frames are dropped if a VLAN is omitted from `switchport trunk allowed vlan` or if untagged Native VLAN IDs mismatch across switch links." },
    { term: "STP BPDU Guard & Err-Disabled Recovery", domain: "CompTIA Network+ (N10-009)", def: "BPDU Guard immediately puts a PortFast edge port into `err-disabled` if a rogue switch sends BPDUs, preventing Layer 2 broadcast storms. Recover via `shutdown` / `no shutdown`." },
    { term: "OSPF Area Adjacency & Extended ACLs", domain: "CompTIA Network+ (N10-009)", def: "OSPF routers on a shared segment must match Area ID (e.g., Area 0), Hello/Dead timers, and interface MTU to reach FULL state. Extended ACLs filter by protocol, source/dest IP, and TCP/UDP port." },
    { term: "IEEE 802.3az Energy Efficient Ethernet (EEE)", domain: "Audinate Dante (Level 2)", def: "EEE powers down idle Gigabit Ethernet PHYs during brief gaps, introducing microsecond wake latency that disrupts PTPv2 audio clock sync. Must be disabled on all AV switches." },
    { term: "Primary/Secondary Isolation & IGMP Snooping", domain: "Audinate Dante (Level 2/3)", def: "Dante Primary and Secondary networks must remain physically or logically (VLAN) isolated. IGMP Snooping with a Querier prunes multicast audio flows so non-subscribed ports aren't flooded." },
    { term: "Dante Domain Manager (DDM), AES67 & DSCP QoS", domain: "Audinate Dante (Level 3)", def: "DDM enables Layer 3 unicast routing across subnets with role-based security. AES67 interoperability uses SAP/SDP and 239.69.x.x multicast at 48 kHz. QoS prioritizes PTP clock (DSCP 56/46) and audio (DSCP 46 EF)." },
    { term: "HDBaseT 10.2 Gbps Ceiling & Shielded Cat6A", domain: "AVIXA CTS (Transport)", def: "Standard HDBaseT video payload is capped at 10.2 Gbps—requiring 4K60 4:2:0 chroma subsampling—and Shielded Cat6A (F/UTP) to prevent alien crosstalk (ANEXT) dropouts." },
    { term: "HDCP 2.2 → 1.4 Down-Conversion", domain: "AVIXA CTS (Encryption)", def: "Protected 4K video requires HDCP 2.2. Legacy HDCP 1.4 displays show a green screen unless a compliant scaling matrix down-converts HDCP and chroma subsampling." },
    { term: "Inverse Square Law, PAG/NAG & Throw Ratio", domain: "AVIXA CTS-D (Design)", def: "Acoustic SPL drops by 6 dB every time distance doubles (20·log10(d2/d1)). Potential Acoustic Gain (PAG) must exceed Needed Acoustic Gain (NAG) before feedback. Throw Ratio = Throw Distance / Image Width." },
    { term: "Acoustic Echo Cancellation (AEC) & ERL", domain: "Q-SYS Level 1 & 2", def: "AEC subtracts far-end receive audio (fed via the AEC Reference pin) from local mic pickup. Echo Return Loss (ERL) and Non-Linear Processing (NLP) eliminate residual echo." },
    { term: "70V High-Z Distributed Audio vs. Low-Z", domain: "Q-SYS Level 2", def: "70V/100V constant-voltage lines use step-down transformers and require High-Z amp mode plus an ~80 Hz High-Pass Filter (HPF) to prevent core saturation and over-current faults." },
    { term: "Fail-Safe Normally-Closed (NC) Fire Alarm GPIO", domain: "Q-SYS Level 2 Control", def: "Life-safety fire alarm relays use Normally-Closed (NC) dry contacts so that if a wire is cut or the alarm trips open, the Q-SYS DSP immediately mutes program audio." }
  ];

  const examQuestions = [
    { domain: "CompTIA A+ (220-1201) • Domain 1", q: "A workstation powers on with spinning fans, no display, and Q-Code LED '55'. What is the mandatory first safety action before latching DDR5 DIMM B2?", options: ["Remove the GPU while powered on to inspect PCIe contacts", "Disconnect AC power and bond an ESD wrist strap to unpainted chassis steel", "Short the CMOS jumper with a metal screwdriver", "Replace the NVMe SSD"], ans: 1, exp: "Always disconnect AC power and attach an ESD wrist strap to bare chassis steel before handling static-sensitive memory modules." },
    { domain: "CompTIA A+ (220-1201) • Domain 2", q: "An AIO liquid-cooled workstation hits 102°C and shuts down under load, even though telemetry shows the pump running at 2,850 RPM. Inspection reveals a clogged front dust filter and brittle thermal paste. What is the proper sequence?", options: ["Apply fresh paste directly on top of the dried paste", "Vacuum the intake filter, clean old TIM off the CPU IHS with 99% isopropyl alcohol, then apply fresh thermal compound", "Disable thermal throttling in UEFI BIOS", "Replace the power supply"], ans: 1, exp: "Always remove dried thermal compound completely with 99% isopropyl alcohol before applying fresh TIM and restoring intake airflow." },
    { domain: "CompTIA A+ (220-1201) • Domain 3", q: "During GPU rendering, a workstation throws WHEA_UNCORRECTABLE_ERROR BSODs and drops its NVMe boot drive. A load multimeter reads +11.18V on the +12V rail. Why is this a hardware fault?", options: ["ATX12V spec requires +12V within ±5% (11.40V–12.60V); 11.18V causes PCIe/NVMe brownouts", "11.18V is normal PCIe 4.0 power-saving voltage", "The CMOS battery is below 3.0V", "DDR5 RAM runs directly off +12V without voltage regulation"], ans: 0, exp: "ATX +12V tolerance is ±5% (11.40V minimum). Drooping to 11.18V destabilizes PCIe lanes and NVMe controllers." },
    { domain: "CompTIA A+ (220-1202) • Domain 4", q: "After replacing a failed motherboard, Windows 11 boots into a blue BitLocker Recovery screen and reports TPM 2.0 missing. What must the technician do?", options: ["Format the NVMe drive and reinstall Windows", "Install/seat the dTPM 2.0 module, enable TPM 2.0 and UEFI Secure Boot, and enter the 48-digit BitLocker recovery key", "Disable UEFI mode and switch to Legacy CSM", "Clear the CMOS battery repeatedly"], ans: 1, exp: "Hardware changes alter PCR measurements; restoring TPM 2.0 + Secure Boot and entering the 48-digit BitLocker recovery key unlocks the OS volume without data loss." },
    { domain: "CompTIA Network+ (N10-009) • Layer 1/2", q: "A user at Wall Drop D-14 receives an APIPA 169.254.x.x IP address, and the IDF patch panel has no labels. Which tool should you use first?", options: ["OTDR fiber reflectometer", "Inductive cable toner and probe", "Wi-Fi spectrum analyzer", "Crimping tool"], ans: 1, exp: "An inductive tone generator and probe traces twisted-pair copper from the wall jack to the exact patch panel port." },
    { domain: "CompTIA Network+ (N10-009) • Switching", q: "Endpoints in VLAN 20 can ping each other on Access Switch SW-01, but cannot ping their default gateway (10.20.0.1) on Core Switch SW-CORE. `show interfaces trunk` displays `Vlans allowed on trunk: 10,99`. What is the fix?", options: ["Enable PortFast on the trunk link", "Add VLAN 20 to the 802.1Q trunk allowed list (`switchport trunk allowed vlan add 20`)", "Change all VLAN 20 ports to half-duplex", "Disable Spanning Tree globally"], ans: 1, exp: "If a VLAN is omitted from `switchport trunk allowed vlan`, the switch drops all 802.1Q frames tagged for that VLAN across the uplink." },
    { domain: "CompTIA Network+ (N10-009) • Resiliency", q: "An edge port configured with PortFast and BPDU Guard enters `err-disabled` when a user plugs in an unmanaged mini-switch. After unplugging the mini-switch, how do you restore the port?", options: ["Reload the core router", "Issue `shutdown` followed by `no shutdown` on the interface", "Convert the port to an 802.1Q trunk", "Disable DHCP snooping"], ans: 1, exp: "BPDU Guard disables edge ports receiving BPDUs to prevent loops. Once the rogue device is removed, bounce the interface with `shutdown` / `no shutdown`." },
    { domain: "CompTIA Network+ (N10-009) • Routing/ACL", q: "Two OSPF routers on a point-to-point fiber link are stuck in INIT/EXSTART and fail to exchange routes. Which mismatch prevents OSPF neighbor adjacency?", options: ["Different hostname strings", "Mismatched OSPF Area IDs or interface MTU sizes", "Different console baud rates", "Using Cat6A instead of Cat6"], ans: 1, exp: "OSPF neighbors must share the same Area ID, Hello/Dead timers, subnet mask, and matching MTU to reach FULL adjacency." },
    { domain: "Audinate Dante • Level 1", q: "A stagebox microphone channel is subscribed to a DSP receiver in Dante Controller, but shows a red warning icon and passes no audio. What is the most common cause?", options: ["Sample rate mismatch (e.g., Transmitter at 96 kHz and Receiver at 48 kHz)", "Phantom power (+48V) is turned on", "The XLR cable is longer than 10 meters", "The switch has PoE+ enabled"], ans: 0, exp: "Dante transmitters and receivers must operate at the exact same sample rate (e.g., 48 kHz) to pass audio." },
    { domain: "Audinate Dante • Level 2", q: "Dante audio clicks intermittently and PTPv2 clock leader election flaps on a managed Gigabit switch. Which switch feature causes PHY sleep-state clock jitter?", options: ["IGMP Snooping", "IEEE 802.3az Energy Efficient Ethernet (EEE)", "DiffServ QoS DSCP 46", "802.1Q VLAN tagging"], ans: 1, exp: "Energy Efficient Ethernet (802.3az) puts idle Gigabit PHYs into low-power sleep states, introducing clock jitter that breaks PTPv2 sync." },
    { domain: "Audinate Dante • Level 2/3", q: "What happens if a technician patches a Dante Primary port and Secondary port into the same VLAN without isolation?", options: ["Automatic sample-rate doubling", "A Layer 2 network loop / broadcast storm that takes down the Dante network", "Automatic failover to AES67", "Zero impact because Dante blocks loops natively"], ans: 1, exp: "Dante Primary and Secondary networks must remain completely isolated (separate switches or VLANs); bridging them creates a switching loop." },
    { domain: "Audinate Dante • Level 3 Enterprise", q: "Which three requirements are essential when integrating third-party AES67 audio streams with Dante devices across routed subnets?", options: ["48 kHz sample rate, SAP/SDP discovery (239.69.x.x multicast), and DiffServ QoS (DSCP 56/46) managed via DDM", "96 kHz sample rate, EEE enabled, and flat unmanaged switches", "Analog XLR loopback cables on every port", "Disabling PTPv2 globally"], ans: 0, exp: "AES67 interoperability with Dante requires 48 kHz sync, SAP multicast discovery, strict-priority DSCP QoS, and DDM for cross-subnet routing." },
    { domain: "AVIXA CTS • Signal Flow", q: "When troubleshooting a conference room display showing 'No Signal' from a table laptop, what is the best systematic methodology?", options: ["Immediately replace the matrix switcher and projector", "Trace signal hop-by-hop from source to sink, checking physical cable seating and active display input first", "Factory-reset the DSP", "Change the network subnet"], ans: 1, exp: "AVIXA CTS methodology emphasizes tracing source-to-sink one hop at a time and verifying physical connections and input selection before swapping hardware." },
    { domain: "AVIXA CTS • Transport & EDID", q: "Why does a 4K @ 60Hz 4:4:4 (17.82 Gbps) signal drop out over a standard HDBaseT transmitter, whereas 4K @ 60Hz 4:2:0 passes reliably?", options: ["HDBaseT has a maximum video payload ceiling of 10.2 Gbps", "4:4:4 chroma is blocked by HDCP 1.4", "HDBaseT only supports analog VGA", "Cat6A cannot carry signals past 10 meters"], ans: 0, exp: "Standard HDBaseT is capped at 10.2 Gbps. Chroma subsampling to 4:2:0 reduces 4K60 bandwidth to 10.2 Gbps so it fits the transport ceiling." },
    { domain: "AVIXA CTS • HDCP Encryption", q: "A laptop desktop displays cleanly on a legacy projector, but turns solid green with 'HDCP Unauthorized' when playing protected 4K streaming video. Why?", options: ["The projector lamp hours expired", "The laptop outputs HDCP 2.2 encryption to a legacy sink supporting max HDCP 1.4 without down-conversion", "The HDMI cable is too short", "The projector aspect ratio is 16:9"], ans: 1, exp: "Protected 4K content enforces HDCP 2.2. Feeding an HDCP 1.4 sink requires an HDCP 2.2-to-1.4 down-converting scaler/matrix." },
    { domain: "AVIXA CTS-D • Acoustics & Optics", q: "If a loudspeaker measures 88 dB SPL at 2 meters in a free field, what is the theoretical SPL at 8 meters according to the Inverse Square Law?", options: ["82 dB SPL", "76 dB SPL", "64 dB SPL", "44 dB SPL"], ans: 1, exp: "Doubling distance from 2m to 4m drops 6 dB (82 dB); doubling again from 4m to 8m drops another 6 dB to 76 dB SPL (20·log10(2/8) = -12 dB)." },
    { domain: "Q-SYS Level 1 • Gain Staging", q: "Why is proper input preamp gain staging (targeting ~ -12 dBFS RMS) critical before applying DSP processing blocks?", options: ["It maximizes signal-to-noise ratio (SNR) while preserving headroom to prevent digital clipping", "It increases PoE+ wattage to the touch panel", "It disables the loudspeaker crossover", "It changes the sample rate to 192 kHz"], ans: 0, exp: "Nominal gain staging keeps audio well above the noise floor while leaving ~12–20 dB of transient headroom before 0 dBFS digital clipping." },
    { domain: "Q-SYS Level 1/2 • AEC", q: "In a Q-SYS conferencing design, far-end participants hear their own voice echoing back even though local speech sounds clear. Which schematic connection is missing?", options: ["Microphone +48V Phantom Power", "Far-End VoIP/USB Receive audio wired into the AEC Reference input pin", "Pink Noise generator wired to Amplifier Channel 2", "Dante RX wired to GPIO pin 1"], ans: 1, exp: "The AEC block requires the far-end receive signal on its Reference pin so it can model and subtract acoustic echo picked up by room mics." },
    { domain: "Q-SYS Level 2 • 70V Amplifiers", q: "A CX-Q 4K4 amplifier trips into Over-Current Protect when driving 70V ceiling speakers because the channel is set to Low-Z (4Ω) with no high-pass filter. Why?", options: ["70V speaker step-down transformers saturate at low frequencies and present near-zero impedance in Low-Z mode", "70V speakers require a crossover Ethernet cable", "Low-Z mode turns off the amplifier fans", "70V speakers only accept balanced mic-level input"], ans: 0, exp: "70V distributed lines must be driven in High-Z (70V) mode with an ~80 Hz High-Pass Filter so low frequencies do not saturate speaker transformers." },
    { domain: "Q-SYS Level 2 • Control & Life Safety", q: "Why are fire-alarm audio mute interfaces wired using a Normally-Closed (NC) relay contact into a Q-SYS GPIO input?", options: ["Fail-safe design: if the fire alarm trips open OR a wire is severed, the DSP immediately detects an open circuit and mutes audio", "NC contacts carry 70V speaker audio directly", "Normally-Open contacts cannot be read by Q-SYS Cores", "NC contacts boost microphone phantom power"], ans: 0, exp: "Normally-Closed (NC) supervision ensures both an active alarm trigger and a broken/cut wire fail-safe into Emergency Mute." }
  ];

  let examState = { idx: 0, score: 0, answered: false, picked: null, finished: false };

  /* ==========================================================================
     7. NAVIGATION & SHARED UI BUILDERS
     ========================================================================== */
  function setView(view) {
    playTone("click");
    currentView = view;
    const tools = getActiveTools();
    selectedTool = tools.length ? tools[0].id : null;
    document.querySelectorAll(".nav-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.view === view);
    });
    render();
  }

  function setTier(bench, tier) {
    playTone("click");
    activeTier[bench] = Number(tier);
    const tools = getActiveTools();
    selectedTool = tools.length ? tools[0].id : null;
    render();
  }

  function renderTierSelector(bench) {
    const cur = activeTier[bench];
    const meta = tierLabels[bench];
    const clsList = ["t1", "t2", "t3", "t4"];
    const detail = benchmarkDetails[bench][cur - 1];
    const key = `${bench}_${cur}`;
    const stat = saveData.tierStats[key] || { correct: 0, attempts: 0 };
    const accuracy = tierAccuracy(key);
    const passed = saveData.completed.includes(key);
    return `
      <div class="tier-bar">
        ${meta.map((t, idx) => {
          const lvl = idx + 1;
          const isDone = saveData.completed.includes(`${bench}_${lvl}`);
          const unlocked = lvl === 1 || saveData.completed.includes(`${bench}_${lvl - 1}`);
          return `
            <button class="tier-btn ${clsList[idx]} ${cur === lvl ? "active" : ""}" data-set-tier="${lvl}" ${unlocked ? "" : "disabled"}>
              <div>
                <div class="tier-meta">${t.tag}</div>
                <div class="tier-name">${t.name}</div>
              </div>
              <span class="tier-pill ${isDone ? "done" : ""}">${isDone ? "✓ PASSED" : unlocked ? `MOD ${lvl}` : "LOCKED"}</span>
            </button>
          `;
        }).join("")}
      </div>
      <div class="benchmark-panel">
        <div class="benchmark-head"><span class="eyebrow">CERTIFICATION OBJECTIVE & RUBRIC</span><span class="benchmark-status ${passed ? "passed" : ""}">${passed ? "OBJECTIVE PASSED ✓" : `REQUIRED PRECISION ≥ ${PASS_THRESHOLD}%`}</span></div>
        <h3>${detail.focus}</h3>
        <p>${detail.standard}</p>
        <div class="benchmark-metrics"><span>Precision <b>${stat.attempts ? `${accuracy}%` : "—"}</b></span><span>Clean Steps / Attempts <b>${stat.correct}/${stat.attempts}</b></span><span>Pass Threshold <b>${PASS_THRESHOLD}%</b></span></div>
        <div class="benchmark-track"><span style="width:${Math.min(100, accuracy)}%"></span></div>
      </div>
    `;
  }

  function renderToolDock() {
    const list = getActiveTools();
    return `
      <div class="tool-dock">
        <div class="tool-dock-label">
          <span>TECHNICIAN FIELD KIT — SELECT INSTRUMENT/CABLE, THEN CLICK TARGET ON HARDWARE STAGE</span>
          <span style="color:var(--teal)">ACTIVE: ${(list.find(t => t.id === selectedTool)?.name || "NONE").toUpperCase()}</span>
        </div>
        <div class="tool-grid">
          ${list.map(t => `
            <button class="tool-btn ${selectedTool === t.id ? "active" : ""}" data-tool="${t.id}">
              <div class="tool-icon">${t.icon}</div>
              <div>
                <div class="tool-name">${t.name}</div>
                <div class="tool-sub">${t.sub}</div>
              </div>
            </button>
          `).join("")}
        </div>
      </div>
    `;
  }

  function render() {
    const ws = document.getElementById("workspace");
    if (currentView === "overview") ws.innerHTML = renderOverview();
    else if (currentView === "pc") ws.innerHTML = renderPC();
    else if (currentView === "network") ws.innerHTML = renderNetwork();
    else if (currentView === "dante") ws.innerHTML = renderDante();
    else if (currentView === "av") ws.innerHTML = renderAV();
    else if (currentView === "qs") ws.innerHTML = renderQS();
    else if (currentView === "glossary") ws.innerHTML = renderGlossary();
    else if (currentView === "exam") ws.innerHTML = renderExam();
    bindTooltips();
  }

  /* ==========================================================================
     8. OVERVIEW SCREEN
     ========================================================================== */
  function renderOverview() {
    const benches = [
      { id: "pc", cert: "COMPTIA A+ (220-1201 & 220-1202)", title: "Track 01: PC Hardware, Thermal, Power & Security", desc: "Covers Core 1 & Core 2 objectives: No-POST DDR5 Q-Code diagnostics, AIO thermal remediation, +12V rail droop & NVMe forensics, plus TPM 2.0 / Secure Boot / BitLocker recovery.", chips: ["L1: DDR5 POST", "L2: AIO/TIM", "L3: +12V/NVMe", "L4: TPM/BitLocker"] },
      { id: "network", cert: "COMPTIA NETWORK+ (N10-009)", title: "Track 02: Cabling, Switching, STP & Routing", desc: "Covers Layer 1–4 enterprise networking: inductive toning & VLAN patching, 802.1Q trunk native/allowed alignment, STP BPDU Guard broadcast storm recovery, and OSPF/ACL troubleshooting.", chips: ["L1: Tone/VLAN", "L2: 802.1Q Trunk", "L3: STP/Port-Sec", "L4: OSPF/ACL"] },
      { id: "dante", cert: "AUDINATE DANTE (LEVELS 1, 2 & 3)", title: "Track 03: Network Audio, PTPv2 & Enterprise DDM", desc: "Covers full Dante certification path: sample-rate sync & matrix routing, IEEE 802.3az EEE jitter & PTPv2 leader election, Primary/Secondary VLAN & IGMP snooping, and DDM / AES67 / DSCP QoS.", chips: ["L1: Sync/Matrix", "L2: PTPv2/EEE", "L3: Pri/Sec IGMP", "L4: DDM/AES67"] },
      { id: "av", cert: "AVIXA CTS & CTS-D", title: "Track 04: Signal Flow, EDID, HDCP & AV Design", desc: "Covers CTS field operations & CTS-D design math: source-to-sink signal flow, Shielded Cat6A & 10.2 Gbps HDBaseT EDID, HDCP 2.2→1.4 down-conversion, and Inverse Square SPL / PAG-NAG / Throw Ratio.", chips: ["L1: Signal Path", "L2: HDBT/EDID", "L3: HDCP 2.2→1.4", "L4: CTS-D Math"] },
      { id: "qs", cert: "Q-SYS LEVEL 1 & LEVEL 2", title: "Track 05: DSP Schematics, AEC, 70V Amps & Control", desc: "Covers Q-SYS Designer & hardware deployment: nominal gain staging & logic mute, Far-End AEC Reference & NLP tuning, 70V High-Z amplifier protection, and NC Fire-Alarm GPIO / UCI / Q-LAN PTP.", chips: ["L1: Gain/Mute", "L2: AEC/NLP", "L3: 70V High-Z", "L4: GPIO/UCI/PTP"] }
    ];

    return `
      <div class="eyebrow">FIELD DISPATCH CENTER // 20-MODULE CERTIFICATION SIMULATOR</div>
      <h1>Complete Multi-Domain IT & AV Engineering Lab</h1>
      <p class="lead">Master every domain across <b>CompTIA A+</b>, <b>CompTIA Network+</b>, <b>Audinate Dante</b>, <b>AVIXA CTS / CTS-D</b>, and <b>Q-SYS Level 1 & 2</b>. Each track features <b>4 progressive certification modules</b> with photorealistic hardware rigs, real-time telemetry, Web Audio diagnostic feedback, and a 20-question mastery exam.</p>
      <div class="cards-grid">
        ${benches.map(b => {
          const flags = [1, 2, 3, 4].map(n => saveData.completed.includes(`${b.id}_${n}`));
          const count = flags.filter(Boolean).length;
          return `
            <div class="bench-card">
              <div>
                <div class="bench-card-top"><span class="bench-badge">${b.cert}</span><span class="nav-tag ${count === 4 ? "done" : ""}">${count}/4 MODULES</span></div>
                <h2>${b.title}</h2>
                <p>${b.desc}</p>
              </div>
              <div>
                <div class="tier-dots">${b.chips.map((lbl, i) => `<div class="tier-chip ${flags[i] ? "done" : ""}">${flags[i] ? "✓ " + lbl : lbl}</div>`).join("")}</div>
                <div class="ctrl-row" style="margin-top:12px;"><button class="btn" style="width:100%;" data-nav="${b.id}">Launch Workbench →</button></div>
              </div>
            </div>
          `;
        }).join("")}
        <div class="bench-card" style="border-color: rgba(245,185,99,0.45);">
          <div>
            <div class="bench-card-top"><span class="bench-badge" style="background:var(--amber-dim);color:var(--amber);">20-QUESTION EXAM & MANUAL</span><span class="nav-tag">${saveData.examBest !== null ? `BEST: ${saveData.examBest}%` : "20 QUESTIONS"}</span></div>
            <h2>Mastery Exam & Engineering Reference</h2>
            <p>Validate your readiness across all 20 certification domains with scenario-based exam questions and detailed technical explanations.</p>
          </div>
          <div class="ctrl-row">
            <button class="btn" data-nav="exam">Start 20-Q Exam</button>
            <button class="btn secondary" data-nav="glossary">Reference Manual</button>
          </div>
        </div>
      </div>
    `;
  }

  /* ==========================================================================
     9. PHOTOREALISTIC HARDWARE RENDERERS (ALL 20 MODULES)
     ========================================================================== */
  function renderPC() {
    const lvl = activeTier.pc;
    if (lvl === 1) {
      const s = pc1, done = s.esdAttached && s.psuChecked && s.postRead && s.ramReseated && s.bootVerified;
      return `
        <div class="eyebrow">TRACK 01 // COMPTIA A+ (220-1201) — MODULE 01</div>
        <h1>Workstation No-POST & DDR5 Memory Fault Diagnosis</h1>
        ${renderTierSelector("pc")}
        <div class="work-order"><div><div class="eyebrow">TICKET PC-101 • HARDWARE DIAGNOSTICS</div><p>Workstation <b>WS-CAD-09</b> spins fans with zero video output. Bond ESD strap, probe PSU rails, decode Q-Code 55, latch DDR5 DIMM B2, and confirm POST A0.</p></div><button class="btn secondary" data-reset-bench="pc_1">Reset Module</button></div>
        <div class="sim-layout">
          <div class="stage-card">
            <div class="stage-header"><div class="stage-title"><span class="pulse-dot ${done ? "" : "amber"}"></span>ATX WORKSTATION CHASSIS // Z790 PCB</div><span style="font:500 10.5px var(--mono); color:${s.esdAttached ? "var(--green)" : "var(--red)"}">ESD: ${s.esdAttached ? "BONDED" : "UNGROUNDED ⚠️"}</span></div>
            <div class="svg-viewport"><div class="svg-tooltip" id="svg-tip"></div>
              <svg viewBox="0 0 760 430" xmlns="http://www.w3.org/2000/svg">${SVG_DEFS}
                <rect x="16" y="14" width="728" height="402" rx="12" fill="url(#chassisSteel)" stroke="#3e5360" stroke-width="3"/>
                ${rackScrew(28,26)}${rackScrew(732,26)}${rackScrew(28,404)}${rackScrew(732,404)}
                <rect x="175" y="38" width="380" height="354" rx="6" fill="url(#pcbGreen)" stroke="#2f5e52" stroke-width="2"/>
                <rect x="175" y="38" width="380" height="354" rx="6" fill="url(#pcbTraces)" opacity="0.6"/>
                <text x="190" y="60" fill="#5ce1cb" font-family="DM Mono" font-size="11">ASUS PRO WS Z790-ACE // REV 2.1</text>
                <g class="hotspot ${s.esdAttached ? "verified" : "fault"}" data-target="pc1_esd" data-tip-title="Unpainted Chassis Steel" data-tip-body="Attach ESD wrist strap before handling internal components.">
                  <rect class="hotspot-ring" x="34" y="34" width="124" height="64" rx="7"/>
                  <circle cx="58" cy="66" r="9" fill="${s.esdAttached ? "#72e6a4" : "#f5b963"}" filter="url(#ledGlow)"/>
                  <text x="76" y="64" fill="#eef6f7" font-family="DM Mono" font-size="10">ESD FRAME</text>
                  <text x="76" y="78" fill="${s.esdAttached ? "#72e6a4" : "#f5b963"}" font-family="DM Mono" font-size="9">${s.esdAttached ? "CLIPPED" : "OPEN"}</text>
                </g>
                <g class="hotspot ${s.psuChecked ? "verified" : ""}" data-target="pc1_psu" data-tip-title="850W 80+ Platinum ATX PSU" data-tip-body="Probe +12V, +5V, +3.3V rails with Fluke Multimeter.">
                  <rect class="hotspot-ring" x="34" y="286" width="124" height="106" rx="7"/>
                  <rect x="44" y="296" width="104" height="86" rx="4" fill="url(#brushedMetal)" stroke="#4c6675"/>
                  <text x="54" y="320" fill="#eef6f7" font-family="DM Mono" font-size="11">PSU 850W</text>
                  <text x="54" y="342" fill="${s.psuChecked ? "#72e6a4" : "#f5b963"}" font-family="DM Mono" font-size="9">${s.psuChecked ? "+12.04V OK" : "PROBE RAILS"}</text>
                </g>
                <rect x="236" y="92" width="128" height="124" rx="10" fill="url(#brushedMetal)" stroke="#587787" stroke-width="2"/>
                <circle cx="300" cy="154" r="40" fill="#101a20" stroke="#5ce1cb" stroke-width="1.5"/>
                <text x="270" y="158" fill="#eef6f7" font-family="DM Mono" font-size="10">LGA1700 CPU</text>
                <g class="hotspot ${s.ramReseated ? "verified" : "fault"}" data-target="pc1_ram" data-tip-title="DDR5 DIMM Slots A1–B2" data-tip-body="DIMM B2 is unlatched! Reseat with Anti-Static Hand.">
                  <rect class="hotspot-ring" x="386" y="84" width="92" height="145" rx="6"/>
                  <rect x="396" y="92" width="10" height="126" rx="2" fill="#1b2b33"/>
                  <rect x="415" y="92" width="12" height="126" rx="2" fill="#244a42" stroke="#72e6a4"/>
                  <rect x="436" y="92" width="10" height="126" rx="2" fill="#1b2b33"/>
                  <rect x="455" y="${s.ramReseated ? "92" : "78"}" width="12" height="126" rx="2" fill="${s.ramReseated ? "#244a42" : "#5e3326"}" stroke="${s.ramReseated ? "#72e6a4" : "#f27474"}" stroke-width="1.5"/>
                  <text x="392" y="242" fill="${s.ramReseated ? "#72e6a4" : "#f27474"}" font-family="DM Mono" font-size="9">${s.ramReseated ? "A2/B2 LOCKED" : "B2 UNLATCHED"}</text>
                </g>
                <g class="hotspot ${s.postRead ? "verified" : "fault"}" data-target="pc1_post" data-tip-title="Q-Code 7-Segment POST LED" data-tip-body="Probe with POST LED Probe to decode hexadecimal error.">
                  <rect class="hotspot-ring" x="488" y="60" width="54" height="44" rx="5"/>
                  <rect x="495" y="67" width="40" height="30" rx="3" fill="#060a0d" stroke="#4c6875"/>
                  <text x="503" y="87" fill="${s.ramReseated ? "#72e6a4" : "#f27474"}" font-family="DM Mono" font-weight="700" font-size="14" filter="url(#ledGlow)">${s.ramReseated ? "A0" : "55"}</text>
                </g>
                <rect x="200" y="268" width="295" height="58" rx="6" fill="url(#brushedMetal)" stroke="#537282" stroke-width="2"/>
                <rect x="205" y="324" width="220" height="4" fill="url(#goldPin)"/>
                <text x="216" y="295" fill="#eef6f7" font-family="DM Mono" font-size="11">PCIe 4.0 x16 WORKSTATION GPU</text>
                <g class="hotspot ${s.bootVerified ? "verified" : ""}" data-target="pc1_pwr" data-tip-title="Chassis Power & DisplayPort Monitor" data-tip-body="Cycle system power and verify video sync.">
                  <rect class="hotspot-ring" x="578" y="48" width="138" height="148" rx="8"/>
                  <rect x="590" y="60" width="114" height="72" rx="4" fill="#091015" stroke="${s.bootVerified ? "#72e6a4" : "#445f6e"}" stroke-width="2"/>
                  <text x="606" y="94" fill="${s.bootVerified ? "#72e6a4" : "#93a8ae"}" font-family="DM Mono" font-size="10">${s.bootVerified ? "OS BOOT OK" : "NO SIGNAL"}</text>
                  <circle cx="647" cy="164" r="16" fill="#172730" stroke="#5ce1cb" stroke-width="2"/>
                  <text x="633" y="168" fill="#5ce1cb" font-family="DM Mono" font-size="9">PWR</text>
                </g>
              </svg>
            </div>
            ${renderToolDock()}
          </div>
          <div class="mentor-col"><div class="mentor-card">
            <div class="mentor-head"><div class="mentor-avatar">A+</div><div><h3>Hardware Mentor</h3><div class="eyebrow" style="font-size:9.5px;">220-1201 • MODULE 01</div></div></div>
            <div class="mentor-msg ${s.mentorTone}">${s.mentorText}</div>
            <div class="cli-box">${s.lastReading}</div>
            <div class="checklist">
              <div class="chk-item ${s.esdAttached ? "done" : "current"}"><div class="chk-box">${s.esdAttached ? "✓" : "1"}</div><div>Attach <b>ESD Wrist Strap</b> to bare chassis steel.</div></div>
              <div class="chk-item ${s.psuChecked ? "done" : s.esdAttached ? "current" : ""}"><div class="chk-box">${s.psuChecked ? "✓" : "2"}</div><div>Measure <b>PSU Rails</b> with Fluke Multimeter.</div></div>
              <div class="chk-item ${s.postRead ? "done" : s.psuChecked ? "current" : ""}"><div class="chk-box">${s.postRead ? "✓" : "3"}</div><div>Decode <b>Q-Code 55</b> with POST LED Probe.</div></div>
              <div class="chk-item ${s.ramReseated ? "done" : s.postRead ? "current" : ""}"><div class="chk-box">${s.ramReseated ? "✓" : "4"}</div><div>Latch <b>DDR5 DIMM B2</b> with Anti-Static Hand.</div></div>
              <div class="chk-item ${s.bootVerified ? "done" : s.ramReseated ? "current" : ""}"><div class="chk-box">${s.bootVerified ? "✓" : "5"}</div><div>Cycle <b>Power / Display</b> to confirm Q-Code A0.</div></div>
            </div>
          </div></div>
        </div>`;
    }
    if (lvl === 2) {
      const s = pc2, done = s.esdAttached && s.telemetryRead && s.filterCleaned && s.pasteCleaned && s.coolerMounted;
      return `
        <div class="eyebrow">TRACK 01 // COMPTIA A+ (220-1201) — MODULE 02</div>
        <h1>Thermal Throttling & AIO Cooling Remediation</h1>
        ${renderTierSelector("pc")}
        <div class="work-order"><div><div class="eyebrow">TICKET PC-204 • THERMAL FORENSICS</div><p>Workstation shuts down under 3D render load. Ground chassis, inspect pump/thermal telemetry, vacuum choked front dust mesh, strip dried TIM with 99% IPA, and mount fresh thermal compound.</p></div><button class="btn secondary" data-reset-bench="pc_2">Reset Module</button></div>
        <div class="sim-layout">
          <div class="stage-card">
            <div class="stage-header"><div class="stage-title"><span class="pulse-dot ${done ? "" : "red"}"></span>CPU IHS & 360mm RADIATOR INTAKE</div><span style="font:500 10.5px var(--mono); color:${s.coolerMounted ? "var(--green)" : "var(--red)"}">CPU PKG: ${s.coolerMounted ? "44°C (NOMINAL)" : "102°C (TJMAX!)"}</span></div>
            <div class="svg-viewport"><div class="svg-tooltip" id="svg-tip"></div>
              <svg viewBox="0 0 760 430" xmlns="http://www.w3.org/2000/svg">${SVG_DEFS}
                <rect x="16" y="14" width="728" height="402" rx="12" fill="url(#chassisSteel)" stroke="#3e5360" stroke-width="3"/>
                <g class="hotspot ${s.esdAttached ? "verified" : "fault"}" data-target="pc2_esd" data-tip-title="Chassis Ground Frame" data-tip-body="Attach ESD wrist strap before servicing CPU cooling.">
                  <rect class="hotspot-ring" x="34" y="34" width="128" height="62" rx="7"/>
                  <circle cx="58" cy="65" r="9" fill="${s.esdAttached ? "#72e6a4" : "#f5b963"}" filter="url(#ledGlow)"/>
                  <text x="76" y="63" fill="#eef6f7" font-family="DM Mono" font-size="10">ESD GROUND</text>
                  <text x="76" y="77" fill="${s.esdAttached ? "#72e6a4" : "#f5b963"}" font-family="DM Mono" font-size="9">${s.esdAttached ? "BONDED" : "OPEN"}</text>
                </g>
                <g class="hotspot ${s.telemetryRead ? "verified" : "fault"}" data-target="pc2_sens" data-tip-title="AIO_PUMP & CPU_FAN Telemetry Header" data-tip-body="Probe with HWMonitor to separate pump failure vs. TIM/airflow starvation.">
                  <rect class="hotspot-ring" x="34" y="114" width="128" height="84" rx="7"/>
                  <text x="46" y="138" fill="#5ce1cb" font-family="DM Mono" font-size="10">FAN/PUMP HDR</text>
                  <text x="46" y="156" fill="#eef6f7" font-family="DM Mono" font-size="9">PUMP: 2850 RPM</text>
                  <text x="46" y="174" fill="${s.coolerMounted ? "#72e6a4" : "#f27474"}" font-family="DM Mono" font-size="9">TEMP: ${s.coolerMounted ? "44°C OK" : "102°C!"}</text>
                </g>
                <g class="hotspot ${s.coolerMounted ? "verified" : "fault"}" data-target="pc2_cpu" data-tip-title="LGA1700 CPU Integrated Heat Spreader (IHS)" data-tip-body="1) Scrub dried TIM with 99% Isopropyl. 2) Apply fresh Thermal Compound & mount coldplate.">
                  <rect class="hotspot-ring" x="235" y="72" width="230" height="230" rx="12"/>
                  <rect x="260" y="96" width="180" height="180" rx="8" fill="url(#pcbGreen)" stroke="#5b7887" stroke-width="2"/>
                  <rect x="292" y="128" width="116" height="116" rx="6" fill="url(#brushedMetal)" stroke="#9fb3bd" stroke-width="2"/>
                  ${!s.pasteCleaned ? `<path d="M 315 150 Q 350 140 385 160 Q 370 205 320 210 Z" fill="#8a7a6a" opacity="0.88"/><text x="314" y="188" fill="#211811" font-family="DM Mono" font-weight="700" font-size="10">DRIED PASTE</text>` : ""}
                  ${s.pasteCleaned && !s.coolerMounted ? `<text x="318" y="190" fill="#eef6f7" font-family="DM Mono" font-weight="700" font-size="10">CLEAN IHS</text>` : ""}
                  ${s.coolerMounted ? `<rect x="276" y="112" width="148" height="148" rx="12" fill="url(#copperHeat)" stroke="#72e6a4" stroke-width="2.5"/><text x="304" y="190" fill="#0a1318" font-family="DM Mono" font-weight="700" font-size="11">AIO MOUNTED</text>` : ""}
                </g>
                <g class="hotspot ${s.filterCleaned ? "verified" : "fault"}" data-target="pc2_filter" data-tip-title="Front 360mm Radiator Intake Dust Filter" data-tip-body="Choked with dust! Clean with HEPA Vacuum/Air tool.">
                  <rect class="hotspot-ring" x="545" y="48" width="172" height="334" rx="9"/>
                  <rect x="558" y="62" width="146" height="306" rx="6" fill="${s.filterCleaned ? "#132229" : "#3a3028"}" stroke="${s.filterCleaned ? "#72e6a4" : "#f5b963"}" stroke-width="2"/>
                  <text x="574" y="92" fill="#eef6f7" font-family="DM Mono" font-size="11">INTAKE MESH</text>
                  <text x="574" y="114" fill="${s.filterCleaned ? "#72e6a4" : "#f5b963"}" font-family="DM Mono" font-size="9.5">${s.filterCleaned ? "AIRFLOW: 98% OK" : "CLOGGED (14% FLOW)"}</text>
                </g>
              </svg>
            </div>
            ${renderToolDock()}
          </div>
          <div class="mentor-col"><div class="mentor-card">
            <div class="mentor-head"><div class="mentor-avatar">A+</div><div><h3>Hardware Mentor</h3><div class="eyebrow" style="font-size:9.5px;">220-1201 • MODULE 02</div></div></div>
            <div class="mentor-msg ${s.mentorTone}">${s.mentorText}</div>
            <div class="cli-box">${s.lastReading}</div>
            <div class="checklist">
              <div class="chk-item ${s.esdAttached ? "done" : "current"}"><div class="chk-box">${s.esdAttached ? "✓" : "1"}</div><div>Ground chassis with <b>ESD Wrist Strap</b>.</div></div>
              <div class="chk-item ${s.telemetryRead ? "done" : s.esdAttached ? "current" : ""}"><div class="chk-box">${s.telemetryRead ? "✓" : "2"}</div><div>Probe <b>Fan/Pump Header</b> with HWMonitor.</div></div>
              <div class="chk-item ${s.filterCleaned ? "done" : s.telemetryRead ? "current" : ""}"><div class="chk-box">${s.filterCleaned ? "✓" : "3"}</div><div>Vacuum clogged <b>Front Intake Mesh</b>.</div></div>
              <div class="chk-item ${s.pasteCleaned ? "done" : s.filterCleaned ? "current" : ""}"><div class="chk-box">${s.pasteCleaned ? "✓" : "4"}</div><div>Scrub dried paste off CPU IHS with <b>99% Isopropyl</b>.</div></div>
              <div class="chk-item ${s.coolerMounted ? "done" : s.pasteCleaned ? "current" : ""}"><div class="chk-box">${s.coolerMounted ? "✓" : "5"}</div><div>Apply <b>Thermal Compound</b> & mount AIO coldplate.</div></div>
            </div>
          </div></div>
        </div>`;
    }
    if (lvl === 3) {
      const s = pc3, done = s.esdAttached && s.railsProbed && s.railSwapped && s.padFixed && s.nvmeReseated && s.biosVerified;
      return `
        <div class="eyebrow">TRACK 01 // COMPTIA A+ (220-1201) — MODULE 03</div>
        <h1>+12V Rail Droop & M.2 NVMe PCIe 4.0 Forensics</h1>
        ${renderTierSelector("pc")}
        <div class="work-order"><div><div class="eyebrow">TICKET PC-309 • POWER & STORAGE</div><p>Render workstation suffers WHEA BSODs and drops its NVMe drive under load. Ground chassis, probe +12V rail droop with Load Multimeter, swap to modular PSU Rail B, apply M.2 thermal pad, reseat NVMe, and verify BIOS boot.</p></div><button class="btn secondary" data-reset-bench="pc_3">Reset Module</button></div>
        <div class="sim-layout">
          <div class="stage-card">
            <div class="stage-header"><div class="stage-title"><span class="pulse-dot ${done ? "" : "red"}"></span>FORENSIC POWER & PCIe 4.0 NVMe STAGE</div><span style="font:500 10.5px var(--mono); color:${s.railSwapped ? "var(--green)" : "var(--red)"}">+12V LOAD: ${s.railSwapped ? "12.02V (IN SPEC)" : "11.18V (FAIL <11.4V)"}</span></div>
            <div class="svg-viewport"><div class="svg-tooltip" id="svg-tip"></div>
              <svg viewBox="0 0 760 430" xmlns="http://www.w3.org/2000/svg">${SVG_DEFS}
                <rect x="16" y="14" width="728" height="402" rx="12" fill="url(#chassisSteel)" stroke="#3e5360" stroke-width="3"/>
                <g class="hotspot ${s.esdAttached ? "verified" : "fault"}" data-target="pc3_esd" data-tip-title="Chassis Ground" data-tip-body="Attach ESD wrist strap before probing load rails or M.2 slots.">
                  <rect class="hotspot-ring" x="34" y="34" width="124" height="60" rx="7"/>
                  <circle cx="56" cy="64" r="8" fill="${s.esdAttached ? "#72e6a4" : "#f5b963"}" filter="url(#ledGlow)"/>
                  <text x="72" y="68" fill="#eef6f7" font-family="DM Mono" font-size="10">ESD STRAP</text>
                </g>
                <g class="hotspot ${s.railSwapped ? "verified" : "fault"}" data-target="pc3_psu" data-tip-title="1200W Multi-Rail Modular PSU" data-tip-body="1) Probe +12V droop with Load Multimeter. 2) Swap sagging Rail A to dedicated Rail B.">
                  <rect class="hotspot-ring" x="34" y="250" width="175" height="145" rx="8"/>
                  <rect x="44" y="260" width="155" height="125" rx="5" fill="url(#brushedMetal)" stroke="#4c6878"/>
                  <text x="56" y="284" fill="#eef6f7" font-family="DM Mono" font-size="11">MODULAR PSU</text>
                  <text x="56" y="306" fill="${s.railSwapped ? "#72e6a4" : "#f27474"}" font-family="DM Mono" font-size="9.5">ACTIVE: ${s.railSwapped ? "12V RAIL B (12.02V)" : "12V RAIL A (11.18V!)"}</text>
                  <text x="56" y="326" fill="#93a8ae" font-family="DM Mono" font-size="9">ATX SPEC: 11.40–12.60V</text>
                </g>
                <g class="hotspot ${s.nvmeReseated ? "verified" : "fault"}" data-target="pc3_nvme" data-tip-title="M.2_1 PCIe 4.0 x4 NVMe Slot" data-tip-body="1) Install M.2 Thermal Pad. 2) Reseat M.2 SSD with Anti-Static Hand.">
                  <rect class="hotspot-ring" x="255" y="135" width="265" height="115" rx="8"/>
                  <rect x="268" y="148" width="238" height="88" rx="5" fill="url(#pcbGreen)" stroke="#4f6d7d"/>
                  <text x="282" y="172" fill="#5ce1cb" font-family="DM Mono" font-size="11">M.2_1 NVMe BOOT SSD</text>
                  <text x="282" y="192" fill="${s.padFixed ? "#72e6a4" : "#f5b963"}" font-family="DM Mono" font-size="9.5">THERMAL PAD: ${s.padFixed ? "INSTALLED (48°C)" : "MISSING GAP (84°C!)"}</text>
                  <text x="282" y="212" fill="${s.nvmeReseated ? "#72e6a4" : "#f27474"}" font-family="DM Mono" font-size="9.5">SEATING: ${s.nvmeReseated ? "PCIe x4 LOCKED" : "UNSEATED / WHEA ERR"}</text>
                </g>
                <g class="hotspot ${s.biosVerified ? "verified" : ""}" data-target="pc3_bios" data-tip-title="UEFI BIOS Boot & SMART Telemetry" data-tip-body="Verify Windows Boot Manager with Anti-Static Hand.">
                  <rect class="hotspot-ring" x="555" y="65" width="165" height="150" rx="8"/>
                  <rect x="565" y="75" width="145" height="130" rx="5" fill="#091015" stroke="${s.biosVerified ? "#72e6a4" : "#445f6e"}"/>
                  <text x="578" y="102" fill="#6bb5ff" font-family="DM Mono" font-size="10.5">UEFI BIOS v1804</text>
                  <text x="578" y="126" fill="${s.biosVerified ? "#72e6a4" : "#f5b963"}" font-family="DM Mono" font-size="9">${s.biosVerified ? "BOOT: NVMe_0 OK" : "BOOT: DEVICE LOST"}</text>
                </g>
              </svg>
            </div>
            ${renderToolDock()}
          </div>
          <div class="mentor-col"><div class="mentor-card">
            <div class="mentor-head"><div class="mentor-avatar">A+</div><div><h3>Hardware Mentor</h3><div class="eyebrow" style="font-size:9.5px;">220-1201 • MODULE 03</div></div></div>
            <div class="mentor-msg ${s.mentorTone}">${s.mentorText}</div>
            <div class="cli-box">${s.lastReading}</div>
            <div class="checklist">
              <div class="chk-item ${s.esdAttached ? "done" : "current"}"><div class="chk-box">${s.esdAttached ? "✓" : "1"}</div><div>Attach <b>ESD Wrist Strap</b> to chassis frame.</div></div>
              <div class="chk-item ${s.railsProbed ? "done" : s.esdAttached ? "current" : ""}"><div class="chk-box">${s.railsProbed ? "✓" : "2"}</div><div>Probe <b>PSU +12V droop</b> with Load Multimeter.</div></div>
              <div class="chk-item ${s.railSwapped ? "done" : s.railsProbed ? "current" : ""}"><div class="chk-box">${s.railSwapped ? "✓" : "3"}</div><div>Swap to dedicated <b>Modular PSU Rail B</b>.</div></div>
              <div class="chk-item ${s.padFixed ? "done" : s.railSwapped ? "current" : ""}"><div class="chk-box">${s.padFixed ? "✓" : "4"}</div><div>Install <b>M.2 Thermal Pad</b> on NVMe heatsink.</div></div>
              <div class="chk-item ${s.biosVerified ? "done" : s.padFixed ? "current" : ""}"><div class="chk-box">${s.biosVerified ? "✓" : "5"}</div><div>Reseat <b>NVMe SSD</b> & verify <b>UEFI Boot</b>.</div></div>
            </div>
          </div></div>
        </div>`;
    }
    // Module 4: Core 2 Security (TPM 2.0, Secure Boot & BitLocker Recovery)
    const s = pc4, done = s.esdAttached && s.tpmReseated && s.biosConfigured && s.bitlockerUnlocked;
    return `
      <div class="eyebrow">TRACK 01 // COMPTIA A+ CORE 2 (220-1202) — MODULE 04</div>
      <h1>TPM 2.0 Hardware Module, UEFI Secure Boot & BitLocker Recovery</h1>
      ${renderTierSelector("pc")}
      <div class="work-order"><div><div class="eyebrow">TICKET PC-412 • CORE 2 SECURITY & OS</div><p>After a motherboard replacement, Windows 11 Pro halts at a BitLocker Recovery screen. Bond ESD strap, reseat the 14-pin SPI dTPM 2.0 module, enable TPM 2.0 + Secure Boot in UEFI, and unlock BitLocker.</p></div><button class="btn secondary" data-reset-bench="pc_4">Reset Module</button></div>
      <div class="sim-layout">
        <div class="stage-card">
          <div class="stage-header"><div class="stage-title"><span class="pulse-dot ${done ? "" : "red"}"></span>SPI dTPM 2.0 HEADER & UEFI SECURITY ENGINE</div><span style="font:500 10.5px var(--mono); color:${done ? "var(--green)" : "var(--red)"}">BITLOCKER: ${done ? "UNLOCKED (PCR VALID)" : "RECOVERY LOCKED 🔒"}</span></div>
          <div class="svg-viewport"><div class="svg-tooltip" id="svg-tip"></div>
            <svg viewBox="0 0 760 430" xmlns="http://www.w3.org/2000/svg">${SVG_DEFS}
              <rect x="16" y="14" width="728" height="402" rx="12" fill="url(#chassisSteel)" stroke="#3e5360" stroke-width="3"/>
              <g class="hotspot ${s.esdAttached ? "verified" : "fault"}" data-target="pc4_esd" data-tip-title="Chassis Ground" data-tip-body="Attach ESD wrist strap before seating the dTPM 2.0 chip.">
                <rect class="hotspot-ring" x="34" y="34" width="128" height="62" rx="7"/>
                <circle cx="58" cy="65" r="9" fill="${s.esdAttached ? "#72e6a4" : "#f5b963"}" filter="url(#ledGlow)"/>
                <text x="76" y="68" fill="#eef6f7" font-family="DM Mono" font-size="10">ESD GROUND</text>
              </g>
              <g class="hotspot ${s.tpmReseated ? "verified" : "fault"}" data-target="pc4_tpm" data-tip-title="14-Pin SPI Discrete TPM 2.0 Module" data-tip-body="Partially unseated after motherboard swap! Reseat with Anti-Static Hand.">
                <rect class="hotspot-ring" x="34" y="135" width="215" height="145" rx="8"/>
                <rect x="44" y="145" width="195" height="125" rx="6" fill="url(#pcbGreen)" stroke="${s.tpmReseated ? "#72e6a4" : "#f27474"}"/>
                <text x="60" y="172" fill="#5ce1cb" font-family="DM Mono" font-size="11">SPI_TPM HEADER</text>
                <rect x="75" y="188" width="90" height="42" rx="4" fill="#18262e" stroke="#8aa3b0"/>
                <text x="86" y="213" fill="#eef6f7" font-family="DM Mono" font-size="9.5">INFINEON SLB9670</text>
                <text x="60" y="252" fill="${s.tpmReseated ? "#72e6a4" : "#f27474"}" font-family="DM Mono" font-size="9.5">${s.tpmReseated ? "TPM 2.0 SEATED ✓" : "UNSEATED / NO DEVICE"}</text>
              </g>
              <g class="hotspot ${s.biosConfigured ? "verified" : "fault"}" data-target="pc4_uefi" data-tip-title="UEFI Firmware Security Setup" data-tip-body="Set TPM 2.0 = Enabled and Secure Boot = Enabled below, then click with UEFI Firmware Key.">
                <rect class="hotspot-ring" x="275" y="65" width="225" height="285" rx="8"/>
                <rect x="285" y="75" width="205" height="265" rx="6" fill="#0b151c" stroke="#4e6c7d"/>
                <text x="300" y="102" fill="#6bb5ff" font-family="DM Mono" font-size="11">UEFI SECURITY SETUP</text>
                <text x="300" y="134" fill="${s.tpmState === "ON" ? "#72e6a4" : "#f27474"}" font-family="DM Mono" font-size="9.5">TPM 2.0 STATE: ${s.tpmState}</text>
                <text x="300" y="160" fill="${s.secureBoot === "ENABLED" ? "#72e6a4" : "#f5b963"}" font-family="DM Mono" font-size="9.5">SECURE BOOT: ${s.secureBoot}</text>
              </g>
              <g class="hotspot ${s.bitlockerUnlocked ? "verified" : "fault"}" data-target="pc4_bitlocker" data-tip-title="Windows 11 BitLocker Recovery Prompt" data-tip-body="Click with BitLocker Key tool once TPM 2.0 and Secure Boot are enabled.">
                <rect class="hotspot-ring" x="520" y="65" width="205" height="285" rx="8"/>
                <rect x="530" y="75" width="185" height="265" rx="6" fill="${s.bitlockerUnlocked ? "#0d241b" : "#122b4a"}" stroke="${s.bitlockerUnlocked ? "#72e6a4" : "#6bb5ff"}"/>
                <text x="545" y="104" fill="#eef6f7" font-family="DM Mono" font-size="10.5">${s.bitlockerUnlocked ? "WINDOWS 11 PRO" : "BITLOCKER RECOVERY"}</text>
                <text x="545" y="132" fill="${s.bitlockerUnlocked ? "#72e6a4" : "#f5b963"}" font-family="DM Mono" font-size="9">${s.bitlockerUnlocked ? "✓ VOLUME C: UNLOCKED" : "ENTER 48-DIGIT KEY"}</text>
              </g>
            </svg>
          </div>
          ${renderToolDock()}
        </div>
        <div class="mentor-col"><div class="mentor-card">
          <div class="mentor-head"><div class="mentor-avatar">A+</div><div><h3>Security Mentor</h3><div class="eyebrow" style="font-size:9.5px;">220-1202 • MODULE 04</div></div></div>
          <div class="mentor-msg ${s.mentorTone}">${s.mentorText}</div>
          <div class="cli-box">${s.lastReading}</div>
          ${s.tpmReseated ? `
            <label class="field-lbl">UEFI TPM 2.0 DEVICE</label>
            <select class="select-ctrl" id="pc4-tpm"><option value="OFF" ${s.tpmState==="OFF"?"selected":""}>Disabled</option><option value="ON" ${s.tpmState==="ON"?"selected":""}>Enabled (dTPM 2.0)</option></select>
            <label class="field-lbl">UEFI SECURE BOOT</label>
            <select class="select-ctrl" id="pc4-sb"><option value="DISABLED" ${s.secureBoot==="DISABLED"?"selected":""}>Disabled (Legacy CSM)</option><option value="ENABLED" ${s.secureBoot==="ENABLED"?"selected":""}>Enabled (Windows UEFI)</option></select>
          ` : ""}
          <div class="checklist">
            <div class="chk-item ${s.esdAttached ? "done" : "current"}"><div class="chk-box">${s.esdAttached ? "✓" : "1"}</div><div>Bond <b>ESD Wrist Strap</b> to chassis frame.</div></div>
            <div class="chk-item ${s.tpmReseated ? "done" : s.esdAttached ? "current" : ""}"><div class="chk-box">${s.tpmReseated ? "✓" : "2"}</div><div>Reseat <b>dTPM 2.0 Module</b> with Anti-Static Hand.</div></div>
            <div class="chk-item ${s.biosConfigured ? "done" : s.tpmReseated ? "current" : ""}"><div class="chk-box">${s.biosConfigured ? "✓" : "3"}</div><div>Enable <b>TPM 2.0 & Secure Boot</b> with UEFI Key.</div></div>
            <div class="chk-item ${s.bitlockerUnlocked ? "done" : s.biosConfigured ? "current" : ""}"><div class="chk-box">${s.bitlockerUnlocked ? "✓" : "4"}</div><div>Enter 48-digit recovery key with <b>BitLocker Key</b>.</div></div>
          </div>
        </div></div>
      </div>`;
  }

  /* ==========================================================================
     10. TRACK 02: COMPTIA NETWORK+ (4 MODULES)
     ========================================================================== */
  function renderNetwork() {
    const lvl = activeTier.network;
    if (lvl === 1) {
      const s = net1, done = s.dropTraced && s.patchedPort7 && s.cliInspected && s.vlanFixed && s.pingVerified;
      return `
        <div class="eyebrow">TRACK 02 // COMPTIA NETWORK+ (N10-009) — MODULE 01</div>
        <h1>IDF Rack Patching & Access VLAN Remediation</h1>
        ${renderTierSelector("network")}
        <div class="work-order"><div><div class="eyebrow">TICKET NET-102 • LAYER 1 & SWITCHING</div><p>Wall Drop D-14 gets an APIPA 169.254.x.x IP. Tone out the unlabeled patch panel, patch Cat6 to Switch Gi0/7, inspect VLANs over console, and move Gi0/7 from VLAN 999 to Staff VLAN 10.</p></div><button class="btn secondary" data-reset-bench="network_1">Reset Module</button></div>
        <div class="sim-layout">
          <div class="stage-card">
            <div class="stage-header"><div class="stage-title"><span class="pulse-dot ${done ? "" : "amber"}"></span>19" IDF RACK // PATCH PANEL PP-01 & SW-IDF-02</div><span style="font:500 10.5px var(--mono); color:var(--teal)">${s.pendingPatchFrom ? `CORD HELD: ${s.pendingPatchFrom} → CLICK TARGET` : "OSI LAYER 1 → 2 → 3"}</span></div>
            <div class="svg-viewport"><div class="svg-tooltip" id="svg-tip"></div>
              <svg viewBox="0 0 760 430" xmlns="http://www.w3.org/2000/svg">${SVG_DEFS}
                <rect x="190" y="18" width="545" height="394" rx="8" fill="url(#brushedMetal)" stroke="#3e5563" stroke-width="2.5"/>
                ${rackScrew(202,32)}${rackScrew(722,32)}${rackScrew(202,398)}${rackScrew(722,398)}
                <g class="hotspot ${s.dropTraced ? "verified" : "fault"}" data-target="net1_drop" data-tip-title="Wall Jack D-14" data-tip-body="Tone out with Fluke Toner/Probe, or verify Layer 3 with Net Tester.">
                  <rect class="hotspot-ring" x="20" y="85" width="146" height="150" rx="9"/>
                  <rect x="34" y="100" width="118" height="120" rx="6" fill="url(#brushedMetal)" stroke="#4c6775"/>
                  <text x="50" y="124" fill="#eef6f7" font-family="DM Mono" font-size="11">DROP D-14</text>
                  <rect x="74" y="146" width="38" height="32" rx="4" fill="#091015" stroke="#5ce1cb"/>
                  <text x="48" y="204" fill="${s.pingVerified ? "#72e6a4" : "#93a8ae"}" font-family="DM Mono" font-size="9">${s.pingVerified ? "10.10.10.42 OK" : "APIPA 169.254"}</text>
                </g>
                <rect x="218" y="42" width="490" height="86" rx="5" fill="#131e24" stroke="#425b69"/>
                <text x="232" y="64" fill="#5ce1cb" font-family="DM Mono" font-size="11">CAT6 PATCH PANEL PP-01 (UNLABELED)</text>
                ${[1,2,3,4,5,6,7,8].map((p, idx) => {
                  const x = 232 + idx * 58, is7 = p === 7;
                  return `<g class="hotspot ${is7 && s.dropTraced ? "verified" : ""}" data-target="net1_pp_${p}" data-tip-title="Patch Port 0${p}" data-tip-body="${is7 && s.dropTraced ? "TONE DETECTED: Wall Drop D-14!" : "Patch Panel Port"}">
                    <rect class="hotspot-ring" x="${x}" y="74" width="46" height="42" rx="4"/>
                    <rect x="${x+4}" y="78" width="38" height="24" rx="2" fill="#091015" stroke="${is7 && s.dropTraced ? "#72e6a4" : "#4b6573"}"/>
                    <text x="${x+14}" y="94" fill="#eef6f7" font-family="DM Mono" font-size="10">0${p}</text>
                    <text x="${x+8}" y="112" fill="${is7 && s.dropTraced ? "#72e6a4" : "#7e959e"}" font-family="DM Mono" font-size="8">${is7 && s.dropTraced ? "TONE!" : "P-0"+p}</text>
                  </g>`;
                }).join("")}
                <rect x="218" y="178" width="490" height="114" rx="5" fill="#16232b" stroke="#4c6878"/>
                <text x="232" y="200" fill="#eef6f7" font-family="DM Mono" font-size="11">CISCO CATALYST SW-IDF-02 // ACCESS SWITCH</text>
                ${[1,2,3,4,5,6,7,8].map((p, idx) => {
                  const x = 232 + idx * 58, is7 = p === 7, up = is7 ? s.patchedPort7 : p <= 3;
                  return `<g class="hotspot ${is7 && s.vlanFixed ? "verified" : is7 ? "fault" : ""}" data-target="net1_sw_${p}" data-tip-title="Switch Port Gi0/${p}" data-tip-body="Access VLAN ${is7 ? s.selectedVlan : "10"}">
                    <rect class="hotspot-ring" x="${x}" y="212" width="46" height="48" rx="4"/>
                    <rect x="${x+4}" y="216" width="38" height="26" rx="2" fill="#091015" stroke="${up ? "#72e6a4" : "#4b6573"}"/>
                    <text x="${x+12}" y="237" fill="#eef6f7" font-family="DM Mono" font-size="9">G0/${p}</text>
                    <text x="${x+5}" y="255" fill="${is7 && !s.vlanFixed ? "#f5b963" : "#72e6a4"}" font-family="DM Mono" font-size="8">V${is7 ? s.selectedVlan : "10"}</text>
                  </g>`;
                }).join("")}
                <g class="hotspot ${s.cliInspected ? "verified" : ""}" data-target="net1_console" data-tip-title="RJ45 Serial Console (9600 8N1)" data-tip-body="Connect console cable to inspect VLAN membership.">
                  <rect class="hotspot-ring" x="232" y="266" width="136" height="20" rx="4"/>
                  <text x="242" y="280" fill="#6bb5ff" font-family="DM Mono" font-size="9.5">CONSOLE [9600 8N1]</text>
                </g>
                ${s.patchedPort7 ? `<path d="M 603 102 C 635 142, 575 182, 603 216" stroke="#5ce1cb" stroke-width="4.5" fill="none" filter="url(#ledGlow)"/>` : ""}
              </svg>
            </div>
            ${renderToolDock()}
          </div>
          <div class="mentor-col"><div class="mentor-card">
            <div class="mentor-head"><div class="mentor-avatar">N+</div><div><h3>NetOps Mentor</h3><div class="eyebrow" style="font-size:9.5px;">N10-009 • MODULE 01</div></div></div>
            <div class="mentor-msg ${s.mentorTone}">${s.mentorText}</div>
            <div class="cli-box">${s.cliLog}</div>
            ${s.cliInspected ? `<label class="field-lbl">ASSIGN Gi0/7 ACCESS VLAN</label><div style="display:flex; gap:8px;"><select class="select-ctrl" id="net1-vlan"><option value="999" ${s.selectedVlan==="999"?"selected":""}>VLAN 999 — PARKING</option><option value="10" ${s.selectedVlan==="10"?"selected":""}>VLAN 10 — STAFF</option></select><button class="btn" id="net1-commit">Commit</button></div>` : ""}
            <div class="checklist">
              <div class="chk-item ${s.dropTraced ? "done" : "current"}"><div class="chk-box">${s.dropTraced ? "✓" : "1"}</div><div>Tone out <b>Wall Drop D-14</b> to locate PP-07.</div></div>
              <div class="chk-item ${s.patchedPort7 ? "done" : s.dropTraced ? "current" : ""}"><div class="chk-box">${s.patchedPort7 ? "✓" : "2"}</div><div>Patch <b>PP-07</b> to <b>Switch Gi0/7</b>.</div></div>
              <div class="chk-item ${s.cliInspected ? "done" : s.patchedPort7 ? "current" : ""}"><div class="chk-box">${s.cliInspected ? "✓" : "3"}</div><div>Connect <b>RJ45 Console</b> to inspect VLANs.</div></div>
              <div class="chk-item ${s.vlanFixed ? "done" : s.cliInspected ? "current" : ""}"><div class="chk-box">${s.vlanFixed ? "✓" : "4"}</div><div>Move Gi0/7 from VLAN 999 to <b>VLAN 10</b>.</div></div>
              <div class="chk-item ${s.pingVerified ? "done" : s.vlanFixed ? "current" : ""}"><div class="chk-box">${s.pingVerified ? "✓" : "5"}</div><div>Verify DHCP & ICMP on <b>Wall Drop D-14</b>.</div></div>
            </div>
          </div></div>
        </div>`;
    }
    if (lvl === 2) {
      const s = net2, done = s.cliInspected && s.allowedFixed && s.nativeFixed && s.dhcpVerified;
      return `
        <div class="eyebrow">TRACK 02 // COMPTIA NETWORK+ (N10-009) — MODULE 02</div>
        <h1>802.1Q Trunk Allowed List & Native VLAN Mismatch</h1>
        ${renderTierSelector("network")}
        <div class="work-order"><div><div class="eyebrow">TICKET NET-208 • 802.1Q TRUNKING</div><p>AV endpoints on <b>VLAN 20</b> cannot reach gateway 10.20.0.1 over uplink trunk <b>Te1/1</b>. Inspect <code>show interfaces trunk</code>, add VLAN 20 to allowed VLANs, align Native VLAN 99, and verify gateway ping.</p></div><button class="btn secondary" data-reset-bench="network_2">Reset Module</button></div>
        <div class="sim-layout">
          <div class="stage-card">
            <div class="stage-header"><div class="stage-title"><span class="pulse-dot ${done ? "" : "amber"}"></span>10G SFP+ 802.1Q TRUNK TOPOLOGY</div><span style="font:500 10.5px var(--mono); color:${s.allowedFixed && s.nativeFixed ? "var(--green)" : "var(--amber)"}">TRUNK Te1/1: ${s.allowedFixed && s.nativeFixed ? "FORWARDING V10,20,99" : "VLAN 20 PRUNED / NATIVE MISMATCH"}</span></div>
            <div class="svg-viewport"><div class="svg-tooltip" id="svg-tip"></div>
              <svg viewBox="0 0 760 430" xmlns="http://www.w3.org/2000/svg">${SVG_DEFS}
                <rect x="16" y="14" width="728" height="402" rx="12" fill="url(#pcbDark)" stroke="#2f434f" stroke-width="2"/>
                <rect x="200" y="38" width="360" height="92" rx="8" fill="url(#brushedMetal)" stroke="#4d6b7d" stroke-width="2"/>
                <text x="220" y="64" fill="#5ce1cb" font-family="DM Mono" font-size="11">SW-CORE-01 // L3 INTER-VLAN ROUTER</text>
                <text x="220" y="84" fill="#eef6f7" font-family="DM Mono" font-size="9.5">SVI VLAN 10: 10.10.0.1/24  |  SVI VLAN 20: 10.20.0.1/24</text>
                <text x="220" y="104" fill="#72e6a4" font-family="DM Mono" font-size="9.5">CORE TRUNK Te1/1: ALLOWED 10,20,99 | NATIVE VLAN 99</text>
                <g class="hotspot ${s.allowedFixed && s.nativeFixed ? "verified" : "fault"}" data-target="net2_trunk" data-tip-title="10G SFP+ 802.1Q Trunk (Te1/1)" data-tip-body="Click with IOS Trunk Config tool after inspecting CLI to commit VLAN 20 and Native VLAN 99.">
                  <rect class="hotspot-ring" x="285" y="142" width="190" height="92" rx="7"/>
                  <line x1="380" y1="130" x2="380" y2="246" stroke="${s.allowedFixed && s.nativeFixed ? "#72e6a4" : "#f5b963"}" stroke-width="5"/>
                  <text x="298" y="176" fill="#eef6f7" font-family="DM Mono" font-size="10">802.1Q TRUNK Te1/1</text>
                  <text x="298" y="194" fill="${s.allowedFixed ? "#72e6a4" : "#f27474"}" font-family="DM Mono" font-size="9">ALLOWED: ${s.allowedVal}</text>
                  <text x="298" y="212" fill="${s.nativeFixed ? "#72e6a4" : "#f5b963"}" font-family="DM Mono" font-size="9">NATIVE: VLAN ${s.nativeVal}</text>
                </g>
                <g class="hotspot ${s.cliInspected ? "verified" : "fault"}" data-target="net2_sw" data-tip-title="Access Switch SW-01 Console" data-tip-body="Click with RJ45 Console tool to inspect show interfaces trunk.">
                  <rect class="hotspot-ring" x="145" y="246" width="470" height="106" rx="8"/>
                  <rect x="155" y="256" width="450" height="86" rx="6" fill="url(#brushedMetal)" stroke="#4d6b7d"/>
                  <text x="174" y="280" fill="#eef6f7" font-family="DM Mono" font-size="11">SW-01 // ACCESS SWITCH (CONSOLE 9600 8N1)</text>
                  <text x="174" y="300" fill="#93a8ae" font-family="DM Mono" font-size="9.5">Gi0/1–12: VLAN 10 (STAFF)   |   Gi0/13–24: VLAN 20 (AV_DANTE)</text>
                  <text x="174" y="320" fill="${s.dhcpVerified ? "#72e6a4" : "#f5b963"}" font-family="DM Mono" font-size="9.5">${s.dhcpVerified ? "✓ GATEWAY 10.20.0.1 REACHABLE (0.4ms)" : "AV ENDPOINTS: NO GATEWAY / DHCP TIMEOUT"}</text>
                </g>
                <g class="hotspot ${s.dhcpVerified ? "verified" : ""}" data-target="net2_endpoint" data-tip-title="VLAN 20 AV Endpoint (DSP-01)" data-tip-body="Test DHCP lease & ICMP ping to 10.20.0.1 with DHCP/ICMP Tester.">
                  <rect class="hotspot-ring" x="265" y="362" width="230" height="42" rx="6"/>
                  <text x="282" y="388" fill="#5ce1cb" font-family="DM Mono" font-size="10">VLAN 20 AV ENDPOINT TEST</text>
                </g>
              </svg>
            </div>
            ${renderToolDock()}
          </div>
          <div class="mentor-col"><div class="mentor-card">
            <div class="mentor-head"><div class="mentor-avatar">N+</div><div><h3>NetOps Mentor</h3><div class="eyebrow" style="font-size:9.5px;">N10-009 • MODULE 02</div></div></div>
            <div class="mentor-msg ${s.mentorTone}">${s.mentorText}</div>
            <div class="cli-box">${s.cliLog}</div>
            ${s.cliInspected ? `
              <label class="field-lbl">TRUNK ALLOWED VLANS</label>
              <select class="select-ctrl" id="net2-allowed"><option value="10,99" ${s.allowedVal==="10,99"?"selected":""}>10,99 (Missing VLAN 20)</option><option value="10,20,99" ${s.allowedVal==="10,20,99"?"selected":""}>10,20,99 (All Active VLANs)</option></select>
              <label class="field-lbl">802.1Q NATIVE VLAN</label>
              <select class="select-ctrl" id="net2-native"><option value="1" ${s.nativeVal==="1"?"selected":""}>VLAN 1 (Mismatch!)</option><option value="99" ${s.nativeVal==="99"?"selected":""}>VLAN 99 (Matched)</option></select>
            ` : ""}
            <div class="checklist">
              <div class="chk-item ${s.cliInspected ? "done" : "current"}"><div class="chk-box">${s.cliInspected ? "✓" : "1"}</div><div>Inspect <b>SW-01</b> with RJ45 Console tool.</div></div>
              <div class="chk-item ${s.allowedFixed && s.nativeFixed ? "done" : s.cliInspected ? "current" : ""}"><div class="chk-box">${s.allowedFixed && s.nativeFixed ? "✓" : "2"}</div><div>Allow <b>VLAN 20</b> & align <b>Native VLAN 99</b> on Te1/1.</div></div>
              <div class="chk-item ${s.dhcpVerified ? "done" : s.allowedFixed && s.nativeFixed ? "current" : ""}"><div class="chk-box">${s.dhcpVerified ? "✓" : "3"}</div><div>Verify DHCP & Ping on <b>VLAN 20 Endpoint</b>.</div></div>
            </div>
          </div></div>
        </div>`;
    }
    if (lvl === 3) {
      const s = net3, done = s.stpInspected && s.bpduGuardEnabled && s.portCleared && s.pingVerified;
      return `
        <div class="eyebrow">TRACK 02 // COMPTIA NETWORK+ (N10-009) — MODULE 03</div>
        <h1>Spanning Tree Broadcast Storm & Err-Disabled Port Forensics</h1>
        ${renderTierSelector("network")}
        <div class="work-order"><div><div class="eyebrow">TICKET NET-315 • LAYER 2 RESILIENCY</div><p>Switch CPU is pinned at 99% from an unauthorized hub loop on <b>Gi0/12</b>, and port <b>Gi0/4</b> is stuck <code>err-disabled</code>. Isolate the loop with BPDU Guard, bounce Gi0/4, and verify 0% packet loss.</p></div><button class="btn secondary" data-reset-bench="network_3">Reset Module</button></div>
        <div class="sim-layout">
          <div class="stage-card">
            <div class="stage-header"><div class="stage-title"><span class="pulse-dot ${done ? "" : "red"}"></span>LAYER 2 STP & PORT-SECURITY FORENSICS</div><span style="font:500 10.5px var(--mono); color:${s.bpduGuardEnabled ? "var(--green)" : "var(--red)"}">SWITCH CPU: ${s.bpduGuardEnabled ? "6% (STABLE)" : "99% (BROADCAST STORM!)"}</span></div>
            <div class="svg-viewport"><div class="svg-tooltip" id="svg-tip"></div>
              <svg viewBox="0 0 760 430" xmlns="http://www.w3.org/2000/svg">${SVG_DEFS}
                <rect x="16" y="14" width="728" height="402" rx="12" fill="url(#pcbDark)" stroke="#2f434f" stroke-width="2"/>
                <g class="hotspot ${s.stpInspected ? "verified" : "fault"}" data-target="net3_console" data-tip-title="SW-01 Management Console" data-tip-body="Inspect Spanning Tree topology and interface status via CLI.">
                  <rect class="hotspot-ring" x="120" y="42" width="520" height="115" rx="8"/>
                  <rect x="130" y="52" width="500" height="95" rx="6" fill="url(#brushedMetal)" stroke="#4d6b7d"/>
                  <text x="150" y="78" fill="#eef6f7" font-family="DM Mono" font-size="11">SW-IDF-02 // L2/L3 ACCESS SWITCH</text>
                  <text x="150" y="98" fill="${s.bpduGuardEnabled ? "#72e6a4" : "#f27474"}" font-family="DM Mono" font-size="9.5">STP STATUS: ${s.bpduGuardEnabled ? "CONVERGED (BPDU GUARD BLOCKED Gi0/12)" : "TCN FLOODING! ROGUE BRIDGE ON Gi0/12"}</text>
                  <text x="150" y="118" fill="${s.portCleared ? "#72e6a4" : "#f5b963"}" font-family="DM Mono" font-size="9.5">PORT Gi0/4: ${s.portCleared ? "UP / CONNECTED (VLAN 10)" : "ERR-DISABLED (PSECURE_VIOLATION)"}</text>
                </g>
                <g class="hotspot ${s.portCleared ? "verified" : "fault"}" data-target="net3_gi4" data-tip-title="Conference Room Port Gi0/4" data-tip-body="Stuck in err-disabled. Use Port Bounce Tool (shut / no shut) after stopping the storm.">
                  <rect class="hotspot-ring" x="85" y="218" width="245" height="145" rx="8"/>
                  <rect x="95" y="228" width="225" height="125" rx="6" fill="#142027" stroke="${s.portCleared ? "#72e6a4" : "#f5b963"}"/>
                  <text x="112" y="254" fill="#eef6f7" font-family="DM Mono" font-size="11">INTERFACE Gi0/4</text>
                  <text x="112" y="276" fill="${s.portCleared ? "#72e6a4" : "#f27474"}" font-family="DM Mono" font-size="9.5">STATE: ${s.portCleared ? "CONNECTED" : "ERR-DISABLED (AMBER)"}</text>
                  <text x="112" y="324" fill="#5ce1cb" font-family="DM Mono" font-size="9">VERIFY WITH PACKET ANALYZER</text>
                </g>
                <g class="hotspot ${s.bpduGuardEnabled ? "verified" : "fault"}" data-target="net3_gi12" data-tip-title="Access Port Gi0/12 — Rogue Unmanaged Loop" data-tip-body="Use BPDU Guard Tool to isolate Gi0/12 immediately.">
                  <rect class="hotspot-ring" x="430" y="218" width="245" height="145" rx="8"/>
                  <rect x="440" y="228" width="225" height="125" rx="6" fill="#142027" stroke="${s.bpduGuardEnabled ? "#72e6a4" : "#f27474"}"/>
                  <text x="456" y="254" fill="#eef6f7" font-family="DM Mono" font-size="11">INTERFACE Gi0/12</text>
                  <text x="456" y="276" fill="${s.bpduGuardEnabled ? "#72e6a4" : "#f27474"}" font-family="DM Mono" font-size="9.5">${s.bpduGuardEnabled ? "BPDU GUARD: TRIPPED/SAFE" : "LOOP DETECTED (99% CPU)"}</text>
                </g>
              </svg>
            </div>
            ${renderToolDock()}
          </div>
          <div class="mentor-col"><div class="mentor-card">
            <div class="mentor-head"><div class="mentor-avatar">N+</div><div><h3>NetOps Mentor</h3><div class="eyebrow" style="font-size:9.5px;">N10-009 • MODULE 03</div></div></div>
            <div class="mentor-msg ${s.mentorTone}">${s.mentorText}</div>
            <div class="cli-box">${s.cliLog}</div>
            <div class="checklist">
              <div class="chk-item ${s.stpInspected ? "done" : "current"}"><div class="chk-box">${s.stpInspected ? "✓" : "1"}</div><div>Inspect <b>SW-01 Console</b> (<code>show spanning-tree</code>).</div></div>
              <div class="chk-item ${s.bpduGuardEnabled ? "done" : s.stpInspected ? "current" : ""}"><div class="chk-box">${s.bpduGuardEnabled ? "✓" : "2"}</div><div>Enable <b>BPDU Guard</b> on <b>Gi0/12</b>.</div></div>
              <div class="chk-item ${s.portCleared ? "done" : s.bpduGuardEnabled ? "current" : ""}"><div class="chk-box">${s.portCleared ? "✓" : "3"}</div><div>Bounce <b>Gi0/4</b> (<code>shutdown</code> / <code>no shutdown</code>).</div></div>
              <div class="chk-item ${s.pingVerified ? "done" : s.portCleared ? "current" : ""}"><div class="chk-box">${s.pingVerified ? "✓" : "4"}</div><div>Verify 0% packet loss on <b>Gi0/4</b> with Packet Analyzer.</div></div>
            </div>
          </div></div>
        </div>`;
    }
    // Module 4: OSPF Area Mismatch & Extended ACL
    const s = net4, done = s.ospfInspected && s.ospfFixed && s.aclFixed && s.wanVerified;
    return `
      <div class="eyebrow">TRACK 02 // COMPTIA NETWORK+ (N10-009) — MODULE 04</div>
      <h1>OSPF Area Adjacency & Extended Firewall ACL Remediation</h1>
      ${renderTierSelector("network")}
      <div class="work-order"><div><div class="eyebrow">TICKET NET-401 • LAYER 3 ROUTING & SECURITY</div><p>Branch router R1 fails to form an OSPF neighbor adjacency with Core R0 (Area 10 vs Area 0 mismatch), and an inbound Extended ACL blocks HTTPS (TCP 443) telemetry. Align OSPF Area 0, permit TCP 443, and verify WAN ping.</p></div><button class="btn secondary" data-reset-bench="network_4">Reset Module</button></div>
      <div class="sim-layout">
        <div class="stage-card">
          <div class="stage-header"><div class="stage-title"><span class="pulse-dot ${done ? "" : "red"}"></span>ENTERPRISE WAN // OSPF AREA 0 & EXTENDED ACL</div><span style="font:500 10.5px var(--mono); color:${done ? "var(--green)" : "var(--red)"}">OSPF: ${s.ospfFixed ? "FULL/DR (AREA 0)" : "INIT/EXSTART (AREA MISMATCH)"}</span></div>
          <div class="svg-viewport"><div class="svg-tooltip" id="svg-tip"></div>
            <svg viewBox="0 0 760 430" xmlns="http://www.w3.org/2000/svg">${SVG_DEFS}
              <rect x="16" y="14" width="728" height="402" rx="12" fill="url(#pcbDark)" stroke="#2f434f" stroke-width="2"/>
              <g class="hotspot ${s.ospfInspected ? "verified" : "fault"}" data-target="net4_r1" data-tip-title="Branch Edge Router R1" data-tip-body="Inspect OSPF neighbor state & ACL counters with Router Console.">
                <rect class="hotspot-ring" x="65" y="65" width="285" height="145" rx="8"/>
                <rect x="75" y="75" width="265" height="125" rx="6" fill="url(#brushedMetal)" stroke="#4d6b7d"/>
                <text x="92" y="102" fill="#5ce1cb" font-family="DM Mono" font-size="11">R1-BRANCH // ISR 4331</text>
                <text x="92" y="128" fill="${s.ospfFixed ? "#72e6a4" : "#f27474"}" font-family="DM Mono" font-size="9.5">OSPF Gi0/0: ${s.ospfFixed ? "AREA 0.0.0.0 (FULL)" : "AREA 0.0.0.10 (MISMATCH!)"}</text>
              </g>
              <g class="hotspot ${s.aclFixed ? "verified" : "fault"}" data-target="net4_acl" data-tip-title="Inbound WAN Extended ACL (ACL-WAN-IN)" data-tip-body="Select Permit TCP 443 below and apply with ACL Policy Editor.">
                <rect class="hotspot-ring" x="410" y="65" width="285" height="145" rx="8"/>
                <rect x="420" y="75" width="265" height="125" rx="6" fill="url(#brushedMetal)" stroke="${s.aclFixed ? "#72e6a4" : "#f5b963"}"/>
                <text x="438" y="102" fill="#6bb5ff" font-family="DM Mono" font-size="11">EXTENDED ACL // WAN-IN</text>
                <text x="438" y="128" fill="${s.aclFixed ? "#72e6a4" : "#f27474"}" font-family="DM Mono" font-size="9.5">RULE 10: ${s.aclFixed ? "PERMIT TCP ANY ANY EQ 443" : "DENY TCP ANY ANY EQ 443!"}</text>
              </g>
              <g class="hotspot ${s.wanVerified ? "verified" : ""}" data-target="net4_wan" data-tip-title="Cloud Telemetry Endpoint (198.51.100.44:443)" data-tip-body="Verify OSPF route & TCP 443 reachability with WAN Probe.">
                <rect class="hotspot-ring" x="210" y="255" width="340" height="115" rx="8"/>
                <rect x="220" y="265" width="320" height="95" rx="6" fill="#0d171d" stroke="${s.wanVerified ? "#72e6a4" : "#4b6778"}"/>
                <text x="240" y="295" fill="#eef6f7" font-family="DM Mono" font-size="11">CLOUD TELEMETRY // 198.51.100.44:443</text>
                <text x="240" y="322" fill="${s.wanVerified ? "#72e6a4" : "#93a8ae"}" font-family="DM Mono" font-size="9.5">${s.wanVerified ? "✓ OSPF ROUTE + HTTPS 443 VERIFIED" : "DESTINATION UNREACHABLE"}</text>
              </g>
            </svg>
          </div>
          ${renderToolDock()}
        </div>
        <div class="mentor-col"><div class="mentor-card">
          <div class="mentor-head"><div class="mentor-avatar">N+</div><div><h3>Routing Mentor</h3><div class="eyebrow" style="font-size:9.5px;">N10-009 • MODULE 04</div></div></div>
          <div class="mentor-msg ${s.mentorTone}">${s.mentorText}</div>
          <div class="cli-box">${s.cliLog}</div>
          ${s.ospfInspected ? `
            <label class="field-lbl">R1 Gi0/0 OSPF AREA</label>
            <select class="select-ctrl" id="net4-area"><option value="10" ${s.ospfArea==="10"?"selected":""}>Area 10 (Mismatch with Core Area 0)</option><option value="0" ${s.ospfArea==="0"?"selected":""}>Area 0 (Backbone Matched)</option></select>
            <label class="field-lbl">EXTENDED ACL RULE 10</label>
            <select class="select-ctrl" id="net4-acl"><option value="DENY_443" ${s.aclRule==="DENY_443"?"selected":""}>deny tcp any any eq 443</option><option value="PERMIT_443" ${s.aclRule==="PERMIT_443"?"selected":""}>permit tcp any any eq 443</option></select>
          ` : ""}
          <div class="checklist">
            <div class="chk-item ${s.ospfInspected ? "done" : "current"}"><div class="chk-box">${s.ospfInspected ? "✓" : "1"}</div><div>Inspect <b>R1 Router Console</b>.</div></div>
            <div class="chk-item ${s.ospfFixed ? "done" : s.ospfInspected ? "current" : ""}"><div class="chk-box">${s.ospfFixed ? "✓" : "2"}</div><div>Align <b>OSPF Area 0</b> with OSPF Area Tool.</div></div>
            <div class="chk-item ${s.aclFixed ? "done" : s.ospfFixed ? "current" : ""}"><div class="chk-box">${s.aclFixed ? "✓" : "3"}</div><div>Permit <b>TCP 443</b> with ACL Policy Editor.</div></div>
            <div class="chk-item ${s.wanVerified ? "done" : s.aclFixed ? "current" : ""}"><div class="chk-box">${s.wanVerified ? "✓" : "4"}</div><div>Verify reachability with <b>WAN Probe</b>.</div></div>
          </div>
        </div></div>
      </div>`;
  }

  /* ==========================================================================
     11. TRACK 03: AUDINATE DANTE (4 MODULES)
     ========================================================================== */
  function renderDante() {
    const lvl = activeTier.dante;
    if (lvl === 1) {
      const s = dante1, done = s.sampleRateSynced && s.routedCh1 && s.routedCh2;
      return `
        <div class="eyebrow">TRACK 03 // AUDINATE DANTE CERTIFICATION — MODULE 01</div>
        <h1>Sample Rate Alignment & Matrix Subscriptions</h1>
        ${renderTierSelector("dante")}
        <div class="work-order"><div><div class="eyebrow">TICKET AV-105 • DANTE LEVEL 1</div><p>Stagebox microphones are online in Dante Controller, but zero audio reaches <b>DSP-CORE-01</b> due to a sample-rate mismatch. Align both devices to <b>48 kHz</b> and subscribe TX 01 & TX 02 to RX 01 & RX 02.</p></div><button class="btn secondary" data-reset-bench="dante_1">Reset Module</button></div>
        <div class="sim-layout">
          <div class="stage-card">
            <div class="stage-header"><div class="stage-title"><span class="pulse-dot ${done ? "" : "amber"}"></span>DANTE CONTROLLER // ROUTING MATRIX</div><span style="font:500 10.5px var(--mono); color:${s.sampleRateSynced ? "var(--green)" : "var(--amber)"}">SYNC: ${s.sampleRateSynced ? "48 kHz MATCHED" : `${s.txRate} kHz vs ${s.rxRate} kHz`}</span></div>
            <div class="svg-viewport"><div class="svg-tooltip" id="svg-tip"></div>
              <svg viewBox="0 0 760 420" xmlns="http://www.w3.org/2000/svg">${SVG_DEFS}
                <rect x="16" y="14" width="728" height="392" rx="12" fill="url(#pcbDark)" stroke="#2c3f4b" stroke-width="2"/>
                <g class="hotspot ${s.sampleRateSynced ? "verified" : "fault"}" data-target="dante1_dev" data-tip-title="STAGEBOX-01 (Transmitter)" data-tip-body="Align sample rate to 48 kHz and verify with Dante Clock/Rate tool.">
                  <rect class="hotspot-ring" x="34" y="42" width="280" height="336" rx="8"/>
                  <rect x="44" y="52" width="260" height="316" rx="6" fill="url(#brushedMetal)" stroke="#425d6c"/>
                  <text x="58" y="76" fill="#5ce1cb" font-family="DM Mono" font-size="11">TX // STAGEBOX-01</text>
                  <text x="58" y="96" fill="${s.sampleRateSynced ? "#72e6a4" : "#f5b963"}" font-family="DM Mono" font-size="10">RATE: ${s.txRate} kHz / 24-BIT</text>
                  <g class="hotspot" data-target="dante1_ch1" data-tip-title="TX 01: Podium Mic" data-tip-body="Subscribe to RX 01 with Dante Matrix Tool.">
                    <rect x="58" y="130" width="232" height="64" rx="6" fill="#172730" stroke="${s.routedCh1 ? "#72e6a4" : "#567382"}"/>
                    <text x="72" y="156" fill="#eef6f7" font-family="DM Mono" font-size="11">TX 01 • PODIUM MIC</text>
                    <text x="72" y="176" fill="#93a8ae" font-family="DM Mono" font-size="9">CH 1 • -14 dBFS</text>
                  </g>
                  <g class="hotspot" data-target="dante1_ch2" data-tip-title="TX 02: Wireless Handheld" data-tip-body="Subscribe to RX 02 with Dante Matrix Tool.">
                    <rect x="58" y="220" width="232" height="64" rx="6" fill="#172730" stroke="${s.routedCh2 ? "#72e6a4" : "#567382"}"/>
                    <text x="72" y="246" fill="#eef6f7" font-family="DM Mono" font-size="11">TX 02 • WIRELESS HH</text>
                    <text x="72" y="266" fill="#93a8ae" font-family="DM Mono" font-size="9">CH 2 • -16 dBFS</text>
                  </g>
                </g>
                <g class="hotspot ${s.sampleRateSynced ? "verified" : "fault"}" data-target="dante1_dev" data-tip-title="DSP-CORE-01 (Receiver)" data-tip-body="Align sample rate to 48 kHz and verify with Dante Clock/Rate tool.">
                  <rect class="hotspot-ring" x="446" y="42" width="280" height="336" rx="8"/>
                  <rect x="456" y="52" width="260" height="316" rx="6" fill="url(#brushedMetal)" stroke="#425d6c"/>
                  <text x="470" y="76" fill="#6bb5ff" font-family="DM Mono" font-size="11">RX // DSP-CORE-01</text>
                  <text x="470" y="96" fill="${s.sampleRateSynced ? "#72e6a4" : "#f27474"}" font-family="DM Mono" font-size="10">RATE: ${s.rxRate} kHz</text>
                  <g class="hotspot" data-target="dante1_ch1">
                    <rect x="470" y="130" width="232" height="64" rx="6" fill="#172730" stroke="${s.routedCh1 ? "#72e6a4" : "#567382"}"/>
                    <text x="484" y="156" fill="#eef6f7" font-family="DM Mono" font-size="11">RX 01 • DSP IN 1</text>
                    <text x="484" y="176" fill="${s.routedCh1 ? "#72e6a4" : "#f5b963"}" font-family="DM Mono" font-size="9">${s.routedCh1 ? "✓ SUBSCRIBED" : "UNSUBSCRIBED"}</text>
                  </g>
                  <g class="hotspot" data-target="dante1_ch2">
                    <rect x="470" y="220" width="232" height="64" rx="6" fill="#172730" stroke="${s.routedCh2 ? "#72e6a4" : "#567382"}"/>
                    <text x="484" y="246" fill="#eef6f7" font-family="DM Mono" font-size="11">RX 02 • DSP IN 2</text>
                    <text x="484" y="266" fill="${s.routedCh2 ? "#72e6a4" : "#f5b963"}" font-family="DM Mono" font-size="9">${s.routedCh2 ? "✓ SUBSCRIBED" : "UNSUBSCRIBED"}</text>
                  </g>
                </g>
                ${s.routedCh1 ? `<line x1="290" y1="162" x2="470" y2="162" stroke="#72e6a4" stroke-width="3.5" filter="url(#ledGlow)"/>` : ""}
                ${s.routedCh2 ? `<line x1="290" y1="252" x2="470" y2="252" stroke="#72e6a4" stroke-width="3.5" filter="url(#ledGlow)"/>` : ""}
              </svg>
            </div>
            ${renderToolDock()}
          </div>
          <div class="mentor-col"><div class="mentor-card">
            <div class="mentor-head"><div class="mentor-avatar">DNT</div><div><h3>Dante Mentor</h3><div class="eyebrow" style="font-size:9.5px;">DANTE L1 • MODULE 01</div></div></div>
            <div class="mentor-msg ${s.mentorTone}">${s.mentorText}</div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:10px;">
              <div><label class="field-lbl">STAGEBOX RATE</label><select class="select-ctrl" id="d1-tx"><option value="96" ${s.txRate==="96"?"selected":""}>96 kHz</option><option value="48" ${s.txRate==="48"?"selected":""}>48 kHz</option></select></div>
              <div><label class="field-lbl">DSP RATE</label><select class="select-ctrl" id="d1-rx"><option value="48" ${s.rxRate==="48"?"selected":""}>48 kHz</option><option value="96" ${s.rxRate==="96"?"selected":""}>96 kHz</option></select></div>
            </div>
            <div class="checklist">
              <div class="chk-item ${s.sampleRateSynced ? "done" : "current"}"><div class="chk-box">${s.sampleRateSynced ? "✓" : "1"}</div><div>Set both to <b>48 kHz</b> & verify with Clock/Rate tool.</div></div>
              <div class="chk-item ${s.routedCh1 ? "done" : s.sampleRateSynced ? "current" : ""}"><div class="chk-box">${s.routedCh1 ? "✓" : "2"}</div><div>Subscribe <b>TX 01</b> → <b>RX 01</b> with Matrix Tool.</div></div>
              <div class="chk-item ${s.routedCh2 ? "done" : s.routedCh1 ? "current" : ""}"><div class="chk-box">${s.routedCh2 ? "✓" : "3"}</div><div>Subscribe <b>TX 02</b> → <b>RX 02</b> with Matrix Tool.</div></div>
            </div>
          </div></div>
        </div>`;
    }
    if (lvl === 2) {
      const s = dante2, done = s.eeeDisabled && s.leaderSet && s.clockVerified;
      return `
        <div class="eyebrow">TRACK 03 // AUDINATE DANTE CERTIFICATION — MODULE 02</div>
        <h1>IEEE 802.3az EEE Clock Jitter & PTPv2 Leader Election</h1>
        ${renderTierSelector("dante")}
        <div class="work-order"><div><div class="eyebrow">TICKET AV-211 • DANTE LEVEL 2 CLOCKING</div><p>Auditorium audio clicks periodically and PTPv2 leader election flaps. Disable <b>Energy Efficient Ethernet (802.3az)</b> on SW-AV-01, set <b>DSP-CORE-01</b> as Preferred Leader with External Sync OFF, and verify clock lock.</p></div><button class="btn secondary" data-reset-bench="dante_2">Reset Module</button></div>
        <div class="sim-layout">
          <div class="stage-card">
            <div class="stage-header"><div class="stage-title"><span class="pulse-dot ${done ? "" : "red"}"></span>CLOCK STATUS & SWITCH QoS / EEE</div><span style="font:500 10.5px var(--mono); color:${done ? "var(--green)" : "var(--red)"}">PTP OFFSET: ${done ? "0.02 µs (LOCKED)" : "420 µs (SLIPPING!)"}</span></div>
            <div class="svg-viewport"><div class="svg-tooltip" id="svg-tip"></div>
              <svg viewBox="0 0 760 420" xmlns="http://www.w3.org/2000/svg">${SVG_DEFS}
                <rect x="16" y="14" width="728" height="392" rx="12" fill="url(#pcbDark)" stroke="#2c3f4b" stroke-width="2"/>
                <g class="hotspot ${s.eeeDisabled ? "verified" : "fault"}" data-target="dante2_sw" data-tip-title="Managed AV Switch SW-AV-01" data-tip-body="Click with Switch Config tool to disable IEEE 802.3az Energy Efficient Ethernet.">
                  <rect class="hotspot-ring" x="130" y="38" width="500" height="105" rx="8"/>
                  <rect x="140" y="48" width="480" height="85" rx="6" fill="url(#brushedMetal)" stroke="#4b6878"/>
                  <text x="160" y="74" fill="#eef6f7" font-family="DM Mono" font-size="11">SW-AV-01 // GIGABIT SWITCH (DSCP EF=46)</text>
                  <text x="160" y="98" fill="${s.eeeDisabled ? "#72e6a4" : "#f27474"}" font-family="DM Mono" font-size="10">802.3az EEE GREEN ETHERNET: ${s.eeeDisabled ? "DISABLED (OPTIMAL)" : "ENABLED ⚠️ (PHY SLEEP)"}</text>
                </g>
                <g class="hotspot ${s.leaderSet && s.clockVerified ? "verified" : "fault"}" data-target="dante2_clock" data-tip-title="Dante Controller — Clock Status Tab" data-tip-body="Configure Preferred Leader = DSP-CORE-01 and External Sync = OFF below, then verify with PTPv2 Clock Tool.">
                  <rect class="hotspot-ring" x="130" y="185" width="500" height="185" rx="8"/>
                  <rect x="140" y="195" width="480" height="165" rx="6" fill="url(#brushedMetal)" stroke="#425d6c"/>
                  <text x="160" y="222" fill="#5ce1cb" font-family="DM Mono" font-size="11">DANTE CLOCK STATUS (IEEE 1588 PTPv2)</text>
                  <text x="160" y="248" fill="${s.leaderSet ? "#72e6a4" : "#f5b963"}" font-family="DM Mono" font-size="10">PREFERRED LEADER: ${s.preferredLeader}</text>
                  <text x="160" y="272" fill="${s.extSync === "OFF" ? "#72e6a4" : "#f27474"}" font-family="DM Mono" font-size="10">EXTERNAL WORD CLOCK SYNC: ${s.extSync}</text>
                  <text x="160" y="302" fill="${s.clockVerified ? "#72e6a4" : "#93a8ae"}" font-family="DM Mono" font-size="10">CLOCK STATE: ${s.clockVerified ? "✓ LOCKED (GRANDMASTER STABLE)" : "ELECTION FLAPPING..."}</text>
                </g>
              </svg>
            </div>
            ${renderToolDock()}
          </div>
          <div class="mentor-col"><div class="mentor-card">
            <div class="mentor-head"><div class="mentor-avatar">DNT</div><div><h3>Dante Mentor</h3><div class="eyebrow" style="font-size:9.5px;">DANTE L2 • MODULE 02</div></div></div>
            <div class="mentor-msg ${s.mentorTone}">${s.mentorText}</div>
            <label class="field-lbl">PREFERRED CLOCK LEADER</label>
            <select class="select-ctrl" id="d2-leader"><option value="NONE" ${s.preferredLeader==="NONE"?"selected":""}>None (Random)</option><option value="DSP-CORE-01" ${s.preferredLeader==="DSP-CORE-01"?"selected":""}>DSP-CORE-01</option></select>
            <label class="field-lbl">EXTERNAL WORD CLOCK SYNC</label>
            <select class="select-ctrl" id="d2-ext"><option value="ON" ${s.extSync==="ON"?"selected":""}>Enabled (Floating BNC)</option><option value="OFF" ${s.extSync==="OFF"?"selected":""}>Disabled (Internal Quartz)</option></select>
            <div class="checklist">
              <div class="chk-item ${s.eeeDisabled ? "done" : "current"}"><div class="chk-box">${s.eeeDisabled ? "✓" : "1"}</div><div>Disable <b>802.3az EEE</b> on SW-AV-01.</div></div>
              <div class="chk-item ${s.leaderSet ? "done" : s.eeeDisabled ? "current" : ""}"><div class="chk-box">${s.leaderSet ? "✓" : "2"}</div><div>Set <b>DSP-CORE-01</b> Preferred Leader & Ext Sync <b>OFF</b>.</div></div>
              <div class="chk-item ${s.clockVerified ? "done" : s.leaderSet ? "current" : ""}"><div class="chk-box">${s.clockVerified ? "✓" : "3"}</div><div>Verify PTPv2 lock with <b>PTPv2 Clock Tool</b>.</div></div>
            </div>
          </div></div>
        </div>`;
    }
    if (lvl === 3) {
      const s = dante3, done = s.vlansIsolated && s.igmpEnabled && s.flowModeFixed && s.verifiedZeroDrop;
      return `
        <div class="eyebrow">TRACK 03 // AUDINATE DANTE CERTIFICATION — MODULE 03</div>
        <h1>Redundant VLAN Isolation & Multicast IGMP Forensics</h1>
        ${renderTierSelector("dante")}
        <div class="work-order"><div><div class="eyebrow">TICKET AV-320 • REDUNDANCY & IGMP</div><p>64-channel Dante network has 1,420 late packets/sec and ARP storms. Primary and Secondary ports are bridged in VLAN 1, and multicast floods non-Dante ports. Isolate Primary (VLAN 10) & Secondary (VLAN 20), enable IGMP Snooping + Querier, and optimize flow.</p></div><button class="btn secondary" data-reset-bench="dante_3">Reset Module</button></div>
        <div class="sim-layout">
          <div class="stage-card">
            <div class="stage-header"><div class="stage-title"><span class="pulse-dot ${done ? "" : "red"}"></span>REDUNDANT DANTE TOPOLOGY & IGMP SNOOPING</div><span style="font:500 10.5px var(--mono); color:${done ? "var(--green)" : "var(--red)"}">LATE PACKETS: ${done ? "0 / SEC" : "1,420 / SEC ⚠️"}</span></div>
            <div class="svg-viewport"><div class="svg-tooltip" id="svg-tip"></div>
              <svg viewBox="0 0 760 420" xmlns="http://www.w3.org/2000/svg">${SVG_DEFS}
                <rect x="16" y="14" width="728" height="392" rx="12" fill="url(#pcbDark)" stroke="#2c3f4b" stroke-width="2"/>
                <g class="hotspot ${s.vlansIsolated ? "verified" : "fault"}" data-target="dante3_vlan" data-tip-title="Primary / Secondary VLAN Architecture" data-tip-body="Separate Primary (VLAN 10) and Secondary (VLAN 20) with VLAN Isolator.">
                  <rect class="hotspot-ring" x="45" y="42" width="315" height="150" rx="8"/>
                  <rect x="55" y="52" width="295" height="130" rx="6" fill="url(#brushedMetal)" stroke="#4b6878"/>
                  <text x="70" y="78" fill="#5ce1cb" font-family="DM Mono" font-size="11">REDUNDANT NETWORK VLANS</text>
                  <text x="70" y="102" fill="${s.vlansIsolated ? "#72e6a4" : "#f27474"}" font-family="DM Mono" font-size="9.5">PRIMARY: ${s.vlansIsolated ? "VLAN 10 (192.168.10.x)" : "VLAN 1 (BRIDGED!)"}</text>
                  <text x="70" y="124" fill="${s.vlansIsolated ? "#72e6a4" : "#f27474"}" font-family="DM Mono" font-size="9.5">SECONDARY: ${s.vlansIsolated ? "VLAN 20 (172.16.10.x)" : "VLAN 1 (ARP STORM!)"}</text>
                </g>
                <g class="hotspot ${s.igmpEnabled ? "verified" : "fault"}" data-target="dante3_igmp" data-tip-title="IGMP Snooping & Querier Engine" data-tip-body="Enable IGMP Snooping + Querier with IGMP Snooping tool.">
                  <rect class="hotspot-ring" x="400" y="42" width="315" height="150" rx="8"/>
                  <rect x="410" y="52" width="295" height="130" rx="6" fill="url(#brushedMetal)" stroke="#4b6878"/>
                  <text x="425" y="78" fill="#6bb5ff" font-family="DM Mono" font-size="11">MULTICAST PRUNING (IGMP)</text>
                  <text x="425" y="102" fill="${s.igmpEnabled ? "#72e6a4" : "#f5b963"}" font-family="DM Mono" font-size="9.5">IGMP SNOOPING: ${s.igmpEnabled ? "ACTIVE" : "DISABLED"}</text>
                  <text x="425" y="124" fill="${s.igmpEnabled ? "#72e6a4" : "#f5b963"}" font-family="DM Mono" font-size="9.5">IGMP QUERIER: ${s.igmpEnabled ? "192.168.10.1" : "NONE"}</text>
                </g>
                <g class="hotspot ${s.flowModeFixed ? "verified" : "fault"}" data-target="dante3_flow" data-tip-title="Dante Flow Configuration" data-tip-body="Prune unnecessary multicast flooding with Flow Optimizer.">
                  <rect class="hotspot-ring" x="140" y="225" width="480" height="145" rx="8"/>
                  <rect x="150" y="235" width="460" height="125" rx="6" fill="url(#brushedMetal)" stroke="#425d6c"/>
                  <text x="170" y="262" fill="#eef6f7" font-family="DM Mono" font-size="11">FLOW TELEMETRY // FOH CONSOLE → DSP-CORE</text>
                  <text x="170" y="288" fill="${s.flowModeFixed ? "#72e6a4" : "#f5b963"}" font-family="DM Mono" font-size="10">FLOW MODE: ${s.flowModeFixed ? "UNICAST / PRUNED MULTICAST" : "UNMANAGED 64-CH FLOOD"}</text>
                </g>
              </svg>
            </div>
            ${renderToolDock()}
          </div>
          <div class="mentor-col"><div class="mentor-card">
            <div class="mentor-head"><div class="mentor-avatar">DNT</div><div><h3>Dante Mentor</h3><div class="eyebrow" style="font-size:9.5px;">DANTE L2/3 • MODULE 03</div></div></div>
            <div class="mentor-msg ${s.mentorTone}">${s.mentorText}</div>
            <div class="checklist">
              <div class="chk-item ${s.vlansIsolated ? "done" : "current"}"><div class="chk-box">${s.vlansIsolated ? "✓" : "1"}</div><div>Isolate <b>Primary (V10)</b> & <b>Secondary (V20)</b> VLANs.</div></div>
              <div class="chk-item ${s.igmpEnabled ? "done" : s.vlansIsolated ? "current" : ""}"><div class="chk-box">${s.igmpEnabled ? "✓" : "2"}</div><div>Enable <b>IGMP Snooping & Querier</b>.</div></div>
              <div class="chk-item ${s.verifiedZeroDrop ? "done" : s.igmpEnabled ? "current" : ""}"><div class="chk-box">${s.verifiedZeroDrop ? "✓" : "3"}</div><div>Optimize 64-Ch flow with <b>Flow Optimizer</b>.</div></div>
            </div>
          </div></div>
        </div>`;
    }
    // Module 4: Dante Level 3 Enterprise (DDM, AES67 & DSCP QoS)
    const s = dante4, done = s.ddmEnrolled && s.aes67Enabled && s.qosMapped;
    return `
      <div class="eyebrow">TRACK 03 // AUDINATE DANTE LEVEL 3 — MODULE 04</div>
      <h1>Dante Domain Manager (DDM), AES67 Interop & DSCP QoS</h1>
      ${renderTierSelector("dante")}
      <div class="work-order"><div><div class="eyebrow">TICKET AV-402 • ENTERPRISE LEVEL 3</div><p>Broadcast facility requires Layer 3 subnet routing via <b>Dante Domain Manager</b>, <b>AES67</b> interoperability (239.69.x.x / 48 kHz) with a third-party intercom, and DiffServ <b>DSCP EF (46)</b> strict priority QoS.</p></div><button class="btn secondary" data-reset-bench="dante_4">Reset Module</button></div>
      <div class="sim-layout">
        <div class="stage-card">
          <div class="stage-header"><div class="stage-title"><span class="pulse-dot ${done ? "" : "amber"}"></span>DANTE DOMAIN MANAGER & AES67 BROADCAST BRIDGE</div><span style="font:500 10.5px var(--mono); color:${done ? "var(--green)" : "var(--amber)"}">DDM L3: ${done ? "ENROLLED & LOCKED" : "UNMANAGED SUBNET ISOLATION"}</span></div>
          <div class="svg-viewport"><div class="svg-tooltip" id="svg-tip"></div>
            <svg viewBox="0 0 760 420" xmlns="http://www.w3.org/2000/svg">${SVG_DEFS}
              <rect x="16" y="14" width="728" height="392" rx="12" fill="url(#pcbDark)" stroke="#2c3f4b" stroke-width="2"/>
              <g class="hotspot ${s.ddmEnrolled ? "verified" : "fault"}" data-target="dante4_ddm" data-tip-title="Dante Domain Manager (DDM Server)" data-tip-body="Enroll Stagebox & DSP into Auditorium L3 Domain with DDM Domain Tool.">
                <rect class="hotspot-ring" x="45" y="45" width="315" height="145" rx="8"/>
                <rect x="55" y="55" width="295" height="125" rx="6" fill="url(#brushedMetal)" stroke="#4b6878"/>
                <text x="72" y="82" fill="#5ce1cb" font-family="DM Mono" font-size="11">DANTE DOMAIN MANAGER</text>
                <text x="72" y="108" fill="${s.ddmEnrolled ? "#72e6a4" : "#f27474"}" font-family="DM Mono" font-size="9.5">DOMAIN: ${s.ddmEnrolled ? "BROADCAST_L3 (ENROLLED)" : "UNMANAGED (NO L3 ROUTE)"}</text>
              </g>
              <g class="hotspot ${s.aes67Enabled ? "verified" : "fault"}" data-target="dante4_aes67" data-tip-title="AES67 / SMPTE ST 2110-30 Interop" data-tip-body="Enable AES67 SAP/SDP 239.69.x.x multicast at 48 kHz with AES67 Bridge tool.">
                <rect class="hotspot-ring" x="400" y="45" width="315" height="145" rx="8"/>
                <rect x="410" y="55" width="295" height="125" rx="6" fill="url(#brushedMetal)" stroke="#4b6878"/>
                <text x="425" y="82" fill="#6bb5ff" font-family="DM Mono" font-size="11">AES67 INTEROP ENGINE</text>
                <text x="425" y="108" fill="${s.aes67Enabled ? "#72e6a4" : "#f5b963"}" font-family="DM Mono" font-size="9.5">AES67 RTP: ${s.aes67Enabled ? "ACTIVE (239.69.1.10 / 48k)" : "DISABLED"}</text>
              </g>
              <g class="hotspot ${s.qosMapped ? "verified" : "fault"}" data-target="dante4_qos" data-tip-title="Enterprise DiffServ QoS Queue Policy" data-tip-body="Map DSCP 56 (PTP) & DSCP 46 EF (Audio) strict priority with DiffServ QoS Tool.">
                <rect class="hotspot-ring" x="140" y="225" width="480" height="145" rx="8"/>
                <rect x="150" y="235" width="460" height="125" rx="6" fill="url(#brushedMetal)" stroke="#425d6c"/>
                <text x="170" y="262" fill="#eef6f7" font-family="DM Mono" font-size="11">DIFFSERV DSCP QoS PRIORITY QUEUES</text>
                <text x="170" y="288" fill="${s.qosMapped ? "#72e6a4" : "#f27474"}" font-family="DM Mono" font-size="10">POLICY: ${s.qosMapped ? "DSCP 56 (CS7 PTP) + DSCP 46 (EF AUDIO)" : "BEST EFFORT (PACKET JITTER!)"}</text>
              </g>
            </svg>
          </div>
          ${renderToolDock()}
        </div>
        <div class="mentor-col"><div class="mentor-card">
          <div class="mentor-head"><div class="mentor-avatar">DNT</div><div><h3>Enterprise Mentor</h3><div class="eyebrow" style="font-size:9.5px;">DANTE L3 • MODULE 04</div></div></div>
          <div class="mentor-msg ${s.mentorTone}">${s.mentorText}</div>
          <div class="checklist">
            <div class="chk-item ${s.ddmEnrolled ? "done" : "current"}"><div class="chk-box">${s.ddmEnrolled ? "✓" : "1"}</div><div>Enroll devices in <b>Dante Domain Manager</b>.</div></div>
            <div class="chk-item ${s.aes67Enabled ? "done" : s.ddmEnrolled ? "current" : ""}"><div class="chk-box">${s.aes67Enabled ? "✓" : "2"}</div><div>Enable <b>AES67 Bridge</b> (SAP / 48 kHz).</div></div>
            <div class="chk-item ${s.qosMapped ? "done" : s.aes67Enabled ? "current" : ""}"><div class="chk-box">${s.qosMapped ? "✓" : "3"}</div><div>Apply <b>DiffServ DSCP EF 46</b> strict priority QoS.</div></div>
          </div>
        </div></div>
      </div>`;
  }

  /* ==========================================================================
     12. TRACK 04: AVIXA CTS & CTS-D (4 MODULES)
     ========================================================================== */
  function renderAV() {
    const lvl = activeTier.av;
    if (lvl === 1) {
      const s = av1, done = s.cableSeated && s.inputSwitched && s.signalVerified;
      return `
        <div class="eyebrow">TRACK 04 // AVIXA CTS CERTIFICATION — MODULE 01</div>
        <h1>Source-to-Sink Physical Signal Flow Troubleshooting</h1>
        ${renderTierSelector("av")}
        <div class="work-order"><div><div class="eyebrow">TICKET ROOM-104 • CTS SIGNAL FLOW</div><p>Presenter connected a laptop at the conference table plate, but the display shows <b>No Signal</b>. Seat the loose HDMI pigtail at the table plate and switch the display from HDMI 2 to HDMI 1.</p></div><button class="btn secondary" data-reset-bench="av_1">Reset Module</button></div>
        <div class="sim-layout">
          <div class="stage-card">
            <div class="stage-header"><div class="stage-title"><span class="pulse-dot ${done ? "" : "amber"}"></span>CONFERENCE ROOM SIGNAL CHAIN</div><span style="font:500 10.5px var(--mono); color:${done ? "var(--green)" : "var(--amber)"}">SYNC: ${done ? "1080p60 LOCKED" : "NO SIGNAL"}</span></div>
            <div class="svg-viewport"><div class="svg-tooltip" id="svg-tip"></div>
              <svg viewBox="0 0 760 410" xmlns="http://www.w3.org/2000/svg">${SVG_DEFS}
                <rect x="16" y="14" width="728" height="382" rx="12" fill="url(#pcbDark)" stroke="#2c3f4b" stroke-width="2"/>
                <rect x="36" y="120" width="145" height="130" rx="8" fill="url(#brushedMetal)" stroke="#4b6878"/>
                <text x="52" y="150" fill="#5ce1cb" font-family="DM Mono" font-size="11">1. LAPTOP</text>
                <text x="52" y="172" fill="#eef6f7" font-family="DM Mono" font-size="10">HDMI OUT ACTIVE</text>
                <g class="hotspot ${s.cableSeated ? "verified" : "fault"}" data-target="av1_plate" data-tip-title="Table Connectivity Box" data-tip-body="HDMI pigtail is backed out! Seat firmly with Cable/Input Tool.">
                  <rect class="hotspot-ring" x="215" y="110" width="165" height="150" rx="8"/>
                  <rect x="225" y="120" width="145" height="130" rx="6" fill="url(#brushedMetal)" stroke="${s.cableSeated ? "#72e6a4" : "#f27474"}"/>
                  <text x="238" y="150" fill="#eef6f7" font-family="DM Mono" font-size="11">2. TABLE PLATE</text>
                  <text x="238" y="176" fill="${s.cableSeated ? "#72e6a4" : "#f27474"}" font-family="DM Mono" font-size="9.5">${s.cableSeated ? "HDMI SEATED ✓" : "LOOSE CONNECTOR!"}</text>
                </g>
                <g class="hotspot ${s.inputSwitched && s.signalVerified ? "verified" : "fault"}" data-target="av1_display" data-tip-title="Room Commercial Display" data-tip-body="Switch to HDMI 1 with Cable/Input Tool, then verify with Sink Verifier.">
                  <rect class="hotspot-ring" x="430" y="95" width="285" height="185" rx="8"/>
                  <rect x="442" y="107" width="261" height="161" rx="6" fill="#091015" stroke="${s.signalVerified ? "#72e6a4" : "#4b6878"}"/>
                  <text x="462" y="140" fill="#eef6f7" font-family="DM Mono" font-size="11">3. ROOM DISPLAY</text>
                  <text x="462" y="168" fill="${s.inputSwitched ? "#72e6a4" : "#f5b963"}" font-family="DM Mono" font-size="10">ACTIVE INPUT: ${s.inputSwitched ? "HDMI 1 (TABLE)" : "HDMI 2 (EMPTY)"}</text>
                  <text x="462" y="196" fill="${s.signalVerified ? "#72e6a4" : "#93a8ae"}" font-family="DM Mono" font-size="10">${s.signalVerified ? "✓ IMAGE VERIFIED" : "NO SIGNAL ON HDMI 2"}</text>
                </g>
              </svg>
            </div>
            ${renderToolDock()}
          </div>
          <div class="mentor-col"><div class="mentor-card">
            <div class="mentor-head"><div class="mentor-avatar">CTS</div><div><h3>CTS Mentor</h3><div class="eyebrow" style="font-size:9.5px;">AVIXA CTS • MODULE 01</div></div></div>
            <div class="mentor-msg ${s.mentorTone}">${s.mentorText}</div>
            <div class="checklist">
              <div class="chk-item ${s.cableSeated ? "done" : "current"}"><div class="chk-box">${s.cableSeated ? "✓" : "1"}</div><div>Seat loose HDMI cable at <b>Table Plate</b>.</div></div>
              <div class="chk-item ${s.inputSwitched ? "done" : s.cableSeated ? "current" : ""}"><div class="chk-box">${s.inputSwitched ? "✓" : "2"}</div><div>Switch <b>Display Input</b> to HDMI 1.</div></div>
              <div class="chk-item ${s.signalVerified ? "done" : s.inputSwitched ? "current" : ""}"><div class="chk-box">${s.signalVerified ? "✓" : "3"}</div><div>Verify video lock with <b>Sink Verifier</b>.</div></div>
            </div>
          </div></div>
        </div>`;
    }
    if (lvl === 2) {
      const s = av2, done = s.cableTested && s.cableShielded && s.edidAnalyzed && s.edidFixed && s.sinkVerified;
      return `
        <div class="eyebrow">TRACK 04 // AVIXA CTS CERTIFICATION — MODULE 02</div>
        <h1>4K60 EDID Bandwidth Ceiling & Shielded Cat6A HDBaseT</h1>
        ${renderTierSelector("av")}
        <div class="work-order"><div><div class="eyebrow">TICKET ROOM-209 • HDBASET TRANSPORT</div><p>Boardroom 4K display sparkles and drops sync at 4K60. Certify the 45m HDBaseT link, install Shielded Cat6A F/UTP, and constrain Matrix EDID to <b>4K60 4:2:0 (10.2 Gbps)</b>.</p></div><button class="btn secondary" data-reset-bench="av_2">Reset Module</button></div>
        <div class="sim-layout">
          <div class="stage-card">
            <div class="stage-header"><div class="stage-title"><span class="pulse-dot ${done ? "" : "amber"}"></span>HDBASET 10.2 Gbps TRANSPORT & EDID</div><span style="font:500 10.5px var(--mono); color:${s.edidFixed ? "var(--green)" : "var(--amber)"}">TMDS: ${s.edidFixed ? "10.2 Gbps (OK)" : "17.82 Gbps (OVER LIMIT)"}</span></div>
            <div class="svg-viewport"><div class="svg-tooltip" id="svg-tip"></div>
              <svg viewBox="0 0 760 410" xmlns="http://www.w3.org/2000/svg">${SVG_DEFS}
                <rect x="16" y="14" width="728" height="382" rx="12" fill="url(#pcbDark)" stroke="#2c3f4b" stroke-width="2"/>
                <g class="hotspot ${s.edidFixed ? "verified" : "fault"}" data-target="av2_matrix" data-tip-title="Presentation Matrix Switcher" data-tip-body="Inspect with EDID/TMDS Probe, then lock EDID to 4K60 4:2:0 (10.2 Gbps).">
                  <rect class="hotspot-ring" x="45" y="55" width="240" height="135" rx="8"/>
                  <rect x="55" y="65" width="220" height="115" rx="6" fill="url(#brushedMetal)" stroke="#4e6c7d"/>
                  <text x="70" y="92" fill="#5ce1cb" font-family="DM Mono" font-size="11">MATRIX / EDID</text>
                  <text x="70" y="116" fill="${s.edidFixed ? "#72e6a4" : "#f27474"}" font-family="DM Mono" font-size="9.5">EDID: ${s.edidFixed ? "4K60 4:2:0 (10.2G)" : "4K60 4:4:4 (17.8G)"}</text>
                </g>
                <g class="hotspot ${s.cableShielded ? "verified" : "fault"}" data-target="av2_cable" data-tip-title="45m HDBaseT Twisted-Pair Run" data-tip-body="1) Test with Cat6A Certifier. 2) Install Shielded Cat6A F/UTP.">
                  <rect class="hotspot-ring" x="235" y="225" width="290" height="90" rx="8"/>
                  <line x1="255" y1="256" x2="505" y2="256" stroke="${s.cableShielded ? "#72e6a4" : "#f27474"}" stroke-width="5"/>
                  <text x="270" y="282" fill="#eef6f7" font-family="DM Mono" font-size="10">HDBASET LINK (45m)</text>
                  <text x="270" y="300" fill="${s.cableShielded ? "#72e6a4" : "#f5b963"}" font-family="DM Mono" font-size="9">${s.cableShielded ? "SHIELDED CAT6A F/UTP ✓" : s.cableTested ? "FAIL: UNSHIELDED UTP!" : "CERTIFY LINK"}</text>
                </g>
                <g class="hotspot ${s.sinkVerified ? "verified" : ""}" data-target="av2_display" data-tip-title="85-inch 4K Display" data-tip-body="Verify final 4K60 lock with Sink Verifier.">
                  <rect class="hotspot-ring" x="475" y="55" width="240" height="135" rx="8"/>
                  <rect x="485" y="65" width="220" height="115" rx="6" fill="#091015" stroke="${s.sinkVerified ? "#72e6a4" : "#4b6778"}"/>
                  <text x="502" y="96" fill="${s.sinkVerified ? "#72e6a4" : "#93a8ae"}" font-family="DM Mono" font-size="11">${s.sinkVerified ? "4K60 LOCKED ✓" : "SPARKLES / DROP"}</text>
                </g>
              </svg>
            </div>
            ${renderToolDock()}
          </div>
          <div class="mentor-col"><div class="mentor-card">
            <div class="mentor-head"><div class="mentor-avatar">CTS</div><div><h3>CTS Mentor</h3><div class="eyebrow" style="font-size:9.5px;">AVIXA CTS • MODULE 02</div></div></div>
            <div class="mentor-msg ${s.mentorTone}">${s.mentorText}</div>
            ${s.edidAnalyzed ? `<label class="field-lbl">MATRIX EDID TABLE</label><div style="display:flex; gap:8px;"><select class="select-ctrl" id="av2-edid"><option value="4K60_444" ${s.edidMode==="4K60_444"?"selected":""}>4K60 4:4:4 (17.82 Gbps)</option><option value="4K60_420" ${s.edidMode==="4K60_420"?"selected":""}>4K60 4:2:0 (10.2 Gbps HDBT)</option></select><button class="btn" id="av2-commit">Set</button></div>` : ""}
            <div class="checklist">
              <div class="chk-item ${s.cableTested ? "done" : "current"}"><div class="chk-box">${s.cableTested ? "✓" : "1"}</div><div>Certify <b>HDBaseT Link</b> with Cat6A Certifier.</div></div>
              <div class="chk-item ${s.cableShielded ? "done" : s.cableTested ? "current" : ""}"><div class="chk-box">${s.cableShielded ? "✓" : "2"}</div><div>Replace UTP with <b>Shielded Cat6A F/UTP</b>.</div></div>
              <div class="chk-item ${s.edidFixed ? "done" : s.cableShielded ? "current" : ""}"><div class="chk-box">${s.edidFixed ? "✓" : "3"}</div><div>Analyze Matrix & set EDID to <b>4K60 4:2:0</b>.</div></div>
              <div class="chk-item ${s.sinkVerified ? "done" : s.edidFixed ? "current" : ""}"><div class="chk-box">${s.sinkVerified ? "✓" : "4"}</div><div>Verify <b>4K Display</b> with Sink Verifier.</div></div>
            </div>
          </div></div>
        </div>`;
    }
    if (lvl === 3) {
      const s = av3, done = s.hdcpAnalyzed && s.hdcpDowngraded && s.colorSpaceSet && s.sinkVerified;
      return `
        <div class="eyebrow">TRACK 04 // AVIXA CTS CERTIFICATION — MODULE 03</div>
        <h1>HDCP 2.2 Down-Conversion & Color Space Handshake</h1>
        ${renderTierSelector("av")}
        <div class="work-order"><div><div class="eyebrow">TICKET ROOM-318 • HDCP & CHROMA</div><p>Protected 4K streaming content turns the legacy auditorium projector bright green with <b>HDCP Unauthorized</b>. Configure Scaling Matrix for <b>HDCP 2.2 → 1.4</b> down-conversion and <b>YCbCr 4:2:2 8-bit</b>.</p></div><button class="btn secondary" data-reset-bench="av_3">Reset Module</button></div>
        <div class="sim-layout">
          <div class="stage-card">
            <div class="stage-header"><div class="stage-title"><span class="pulse-dot ${done ? "" : "red"}"></span>SCALING MATRIX & HDCP ENCRYPTION ENGINE</div><span style="font:500 10.5px var(--mono); color:${done ? "var(--green)" : "var(--red)"}">HDCP AUTH: ${done ? "1.4 DOWN-CONVERTED OK" : "2.2 → 1.4 REJECTED!"}</span></div>
            <div class="svg-viewport"><div class="svg-tooltip" id="svg-tip"></div>
              <svg viewBox="0 0 760 410" xmlns="http://www.w3.org/2000/svg">${SVG_DEFS}
                <rect x="16" y="14" width="728" height="382" rx="12" fill="url(#pcbDark)" stroke="#2c3f4b" stroke-width="2"/>
                <g class="hotspot ${s.hdcpAnalyzed && s.hdcpDowngraded && s.colorSpaceSet ? "verified" : "fault"}" data-target="av3_scaler" data-tip-title="4K Scaling Presentation Matrix" data-tip-body="1) Inspect with HDCP/Color Probe. 2) Apply HDCP 1.4 & YCbCr 4:2:2 below, then click with Scaler Config.">
                  <rect class="hotspot-ring" x="115" y="65" width="275" height="265" rx="8"/>
                  <rect x="125" y="75" width="255" height="245" rx="6" fill="url(#brushedMetal)" stroke="#4e6c7d"/>
                  <text x="142" y="104" fill="#5ce1cb" font-family="DM Mono" font-size="11">4K SCALING MATRIX</text>
                  <text x="142" y="162" fill="${s.hdcpDowngraded ? "#72e6a4" : "#f27474"}" font-family="DM Mono" font-size="9.5">HDCP OUT: ${s.hdcpDowngraded ? "HDCP 1.4 CONVERTED" : "PASS-THROUGH 2.2 (FAIL)"}</text>
                  <text x="142" y="192" fill="${s.colorSpaceSet ? "#72e6a4" : "#f5b963"}" font-family="DM Mono" font-size="9.5">CHROMA: ${s.colorSpaceSet ? "YCbCr 4:2:2 8-BIT" : "RGB 4:4:4 10-BIT"}</text>
                </g>
                <g class="hotspot ${s.sinkVerified ? "verified" : "fault"}" data-target="av3_proj" data-tip-title="Legacy Auditorium Laser Projector" data-tip-body="Verify stream lock with Projector Lock tool.">
                  <rect class="hotspot-ring" x="440" y="65" width="270" height="265" rx="8"/>
                  <rect x="450" y="75" width="250" height="245" rx="6" fill="${s.sinkVerified ? "#091015" : "#153620"}" stroke="${s.sinkVerified ? "#72e6a4" : "#f27474"}" stroke-width="2"/>
                  <text x="468" y="106" fill="#eef6f7" font-family="DM Mono" font-size="11">AUDITORIUM PROJECTOR</text>
                  <text x="468" y="138" fill="${s.sinkVerified ? "#72e6a4" : "#f27474"}" font-family="DM Mono" font-size="10">${s.sinkVerified ? "✓ PROTECTED STREAM OK" : "GREEN SCREEN / HDCP ERR"}</text>
                </g>
              </svg>
            </div>
            ${renderToolDock()}
          </div>
          <div class="mentor-col"><div class="mentor-card">
            <div class="mentor-head"><div class="mentor-avatar">CTS</div><div><h3>CTS Mentor</h3><div class="eyebrow" style="font-size:9.5px;">AVIXA CTS • MODULE 03</div></div></div>
            <div class="mentor-msg ${s.mentorTone}">${s.mentorText}</div>
            ${s.hdcpAnalyzed ? `
              <label class="field-lbl">SCALER HDCP ENGINE</label>
              <select class="select-ctrl" id="av3-hdcp"><option value="PASS_22" ${s.hdcpMode==="PASS_22"?"selected":""}>Pass-Through HDCP 2.2</option><option value="CONV_14" ${s.hdcpMode==="CONV_14"?"selected":""}>Down-Convert HDCP 2.2 → 1.4</option></select>
              <label class="field-lbl">OUTPUT COLOR SPACE</label>
              <select class="select-ctrl" id="av3-color"><option value="RGB_10BIT" ${s.colorMode==="RGB_10BIT"?"selected":""}>RGB 4:4:4 10-Bit</option><option value="YCBCR_422" ${s.colorMode==="YCBCR_422"?"selected":""}>YCbCr 4:2:2 8-Bit</option></select>
            ` : ""}
            <div class="checklist">
              <div class="chk-item ${s.hdcpAnalyzed ? "done" : "current"}"><div class="chk-box">${s.hdcpAnalyzed ? "✓" : "1"}</div><div>Probe Matrix with <b>HDCP/Color Probe</b>.</div></div>
              <div class="chk-item ${s.hdcpDowngraded && s.colorSpaceSet ? "done" : s.hdcpAnalyzed ? "current" : ""}"><div class="chk-box">${s.hdcpDowngraded && s.colorSpaceSet ? "✓" : "2"}</div><div>Enable <b>HDCP 1.4</b> & <b>YCbCr 4:2:2</b> on Scaler.</div></div>
              <div class="chk-item ${s.sinkVerified ? "done" : s.hdcpDowngraded && s.colorSpaceSet ? "current" : ""}"><div class="chk-box">${s.sinkVerified ? "✓" : "3"}</div><div>Verify stream lock with <b>Projector Lock</b> tool.</div></div>
            </div>
          </div></div>
        </div>`;
    }
    // Module 4: AVIXA CTS-D Design Engineering (Inverse Square SPL, PAG/NAG & Throw Ratio)
    const s = av4, done = s.splCalculated && s.pagVerified && s.throwCalibrated;
    return `
      <div class="eyebrow">TRACK 04 // AVIXA CTS-D DESIGN ENGINEERING — MODULE 04</div>
      <h1>Acoustic Inverse Square Law, PAG/NAG Stability & Lens Throw Ratio</h1>
      ${renderTierSelector("av")}
      <div class="work-order"><div><div class="eyebrow">TICKET DESIGN-405 • CTS-D CALCULATIONS</div><p>Sign off on the auditorium AV design package: (1) Calculate SPL at 8m when 2m reads 88 dB SPL, (2) Verify Potential Acoustic Gain (PAG ≥ NAG) before feedback, and (3) Calculate Throw Ratio for a 3.0m wide screen at 4.5m distance.</p></div><button class="btn secondary" data-reset-bench="av_4">Reset Module</button></div>
      <div class="sim-layout">
        <div class="stage-card">
          <div class="stage-header"><div class="stage-title"><span class="pulse-dot ${done ? "" : "amber"}"></span>AUDITORIUM ACOUSTIC & PROJECTION CAD BENCH</div><span style="font:500 10.5px var(--mono); color:${done ? "var(--green)" : "var(--amber)"}">CTS-D SIGN-OFF: ${done ? "ALL 3 SPECS VERIFIED ✓" : "PENDING ENGINEERING CHECKS"}</span></div>
          <div class="svg-viewport"><div class="svg-tooltip" id="svg-tip"></div>
            <svg viewBox="0 0 760 410" xmlns="http://www.w3.org/2000/svg">${SVG_DEFS}
              <rect x="16" y="14" width="728" height="382" rx="12" fill="url(#pcbDark)" stroke="#2c3f4b" stroke-width="2"/>
              <g class="hotspot ${s.splCalculated ? "verified" : "fault"}" data-target="av4_spl" data-tip-title="Inverse Square Law SPL (2m → 8m)" data-tip-body="Select SPL at 8m below, then verify with SPL & Distance Meter.">
                <rect class="hotspot-ring" x="45" y="55" width="210" height="295" rx="8"/>
                <rect x="55" y="65" width="190" height="275" rx="6" fill="url(#brushedMetal)" stroke="#4b6878"/>
                <text x="70" y="94" fill="#5ce1cb" font-family="DM Mono" font-size="11">1. INVERSE SQUARE</text>
                <text x="70" y="122" fill="#eef6f7" font-family="DM Mono" font-size="9.5">REF: 88 dB @ 2m</text>
                <text x="70" y="146" fill="#93a8ae" font-family="DM Mono" font-size="9">20·log10(2/8) = -12 dB</text>
                <text x="70" y="180" fill="${s.splCalculated ? "#72e6a4" : "#f5b963"}" font-family="DM Mono" font-size="10">8m SPL: ${s.splAnswer} dB</text>
              </g>
              <g class="hotspot ${s.pagVerified ? "verified" : "fault"}" data-target="av4_pag" data-tip-title="Sound Reinforcement Feedback Margin" data-tip-body="Select PAG ≥ NAG stable gain margin below, then verify with PAG / NAG Analyzer.">
                <rect class="hotspot-ring" x="275" y="55" width="210" height="295" rx="8"/>
                <rect x="285" y="65" width="190" height="275" rx="6" fill="url(#brushedMetal)" stroke="#4b6878"/>
                <text x="300" y="94" fill="#6bb5ff" font-family="DM Mono" font-size="11">2. PAG vs NAG</text>
                <text x="300" y="122" fill="#eef6f7" font-family="DM Mono" font-size="9.5">NEEDED GAIN: 14 dB</text>
                <text x="300" y="146" fill="#93a8ae" font-family="DM Mono" font-size="9">REQUIRED: PAG ≥ NAG</text>
                <text x="300" y="180" fill="${s.pagVerified ? "#72e6a4" : "#f27474"}" font-family="DM Mono" font-size="10">${s.pagVerified ? "PAG 18 dB ≥ NAG 14 dB ✓" : "RINGING / FEEDBACK!"}</text>
              </g>
              <g class="hotspot ${s.throwCalibrated ? "verified" : "fault"}" data-target="av4_lens" data-tip-title="Projector Optics Throw Ratio" data-tip-body="Throw Ratio = Distance (4.5m) / Image Width (3.0m). Select below & verify with Throw Ratio Optics.">
                <rect class="hotspot-ring" x="505" y="55" width="210" height="295" rx="8"/>
                <rect x="515" y="65" width="190" height="275" rx="6" fill="url(#brushedMetal)" stroke="#4b6878"/>
                <text x="530" y="94" fill="#f5b963" font-family="DM Mono" font-size="11">3. LENS OPTICS</text>
                <text x="530" y="122" fill="#eef6f7" font-family="DM Mono" font-size="9.5">THROW DIST: 4.5m</text>
                <text x="530" y="146" fill="#93a8ae" font-family="DM Mono" font-size="9">SCREEN WIDTH: 3.0m</text>
                <text x="530" y="180" fill="${s.throwCalibrated ? "#72e6a4" : "#f5b963"}" font-family="DM Mono" font-size="10">RATIO: ${s.throwRatio}:1</text>
              </g>
            </svg>
          </div>
          ${renderToolDock()}
        </div>
        <div class="mentor-col"><div class="mentor-card">
          <div class="mentor-head"><div class="mentor-avatar">CTS</div><div><h3>CTS-D Mentor</h3><div class="eyebrow" style="font-size:9.5px;">AVIXA CTS-D • MODULE 04</div></div></div>
          <div class="mentor-msg ${s.mentorTone}">${s.mentorText}</div>
          <label class="field-lbl">1. SPL AT 8 METERS (FROM 88 dB @ 2m)</label>
          <select class="select-ctrl" id="av4-spl"><option value="82" ${s.splAnswer==="82"?"selected":""}>82 dB SPL (-6 dB)</option><option value="76" ${s.splAnswer==="76"?"selected":""}>76 dB SPL (-12 dB)</option></select>
          <label class="field-lbl">2. ACOUSTIC GAIN STABILITY</label>
          <select class="select-ctrl" id="av4-pag"><option value="FAIL_LOOP" ${s.pagMargin==="FAIL_LOOP"?"selected":""}>PAG 11 dB < NAG 14 dB (Feedback)</option><option value="PASS_PAG" ${s.pagMargin==="PASS_PAG"?"selected":""}>PAG 18 dB ≥ NAG 14 dB (Stable)</option></select>
          <label class="field-lbl">3. LENS THROW RATIO (4.5m / 3.0m)</label>
          <select class="select-ctrl" id="av4-throw"><option value="0.8" ${s.throwRatio==="0.8"?"selected":""}>0.8:1 Short-Throw</option><option value="1.5" ${s.throwRatio==="1.5"?"selected":""}>1.5:1 Standard Zoom</option></select>
          <div class="checklist">
            <div class="chk-item ${s.splCalculated ? "done" : "current"}"><div class="chk-box">${s.splCalculated ? "✓" : "1"}</div><div>Verify <b>76 dB SPL</b> with SPL & Distance Meter.</div></div>
            <div class="chk-item ${s.pagVerified ? "done" : s.splCalculated ? "current" : ""}"><div class="chk-box">${s.pagVerified ? "✓" : "2"}</div><div>Confirm <b>PAG ≥ NAG</b> with PAG/NAG Analyzer.</div></div>
            <div class="chk-item ${s.throwCalibrated ? "done" : s.pagVerified ? "current" : ""}"><div class="chk-box">${s.throwCalibrated ? "✓" : "3"}</div><div>Verify <b>1.5:1 Throw Ratio</b> with Lens Optics tool.</div></div>
          </div>
        </div></div>
      </div>`;
  }

  /* ==========================================================================
     13. TRACK 05: Q-SYS LEVEL 1 & 2 (4 MODULES)
     ========================================================================== */
  function renderQS() {
    const lvl = activeTier.qs;
    if (lvl === 1) {
      const s = qs1, gainGood = s.micGain >= 3 && s.micGain <= 9, done = s.gainStaged && !s.logicMuted && s.ampVerified;
      return `
        <div class="eyebrow">TRACK 05 // Q-SYS LEVEL 1 & 2 — MODULE 01</div>
        <h1>Signal Flow Tracing, Gain Staging & Logic Mute</h1>
        ${renderTierSelector("qs")}
        <div class="work-order"><div><div class="eyebrow">TICKET DSP-103 • Q-SYS SIGNAL FLOW</div><p>Mic input level is weak (-34 dBFS) and room speakers are silent. Stage Mic Gain into the nominal +3 to +9 dB green zone, clear the stuck Mute block, and verify the CX-Q amplifier.</p></div><button class="btn secondary" data-reset-bench="qs_1">Reset Module</button></div>
        <div class="sim-layout">
          <div class="stage-card">
            <div class="stage-header"><div class="stage-title"><span class="pulse-dot ${done ? "" : "amber"}"></span>Q-SYS DESIGNER // CORE-110f SIGNAL CHAIN</div><span style="font:500 10.5px var(--mono); color:${gainGood ? "var(--green)" : "var(--amber)"}">RMS: ${gainGood ? "-12 dBFS (NOMINAL)" : s.micGain > 10 ? "+2 dBFS (CLIP!)" : "-34 dBFS (LOW)"}</span></div>
            <div class="svg-viewport"><div class="svg-tooltip" id="svg-tip"></div>
              <svg viewBox="0 0 760 400" xmlns="http://www.w3.org/2000/svg">${SVG_DEFS}
                <rect x="16" y="14" width="728" height="372" rx="12" fill="url(#pcbDark)" stroke="#283c47" stroke-width="2"/>
                <g class="hotspot ${s.gainStaged ? "verified" : "fault"}" data-target="qs1_gain" data-tip-title="Mic/Line Input 1 Preamp" data-tip-body="Adjust gain slider into green (+3 to +9 dB), then validate with Gain/Trim Tool.">
                  <rect class="hotspot-ring" x="45" y="110" width="185" height="165" rx="8"/>
                  <rect x="55" y="120" width="165" height="145" rx="6" fill="url(#brushedMetal)" stroke="#4c6878"/>
                  <text x="70" y="148" fill="#5ce1cb" font-family="DM Mono" font-size="11">MIC IN 1</text>
                  <text x="70" y="176" fill="#eef6f7" font-family="DM Mono" font-size="11">GAIN: ${s.micGain > 0 ? "+"+s.micGain : s.micGain} dB</text>
                  <text x="70" y="204" fill="${gainGood ? "#72e6a4" : "#f5b963"}" font-family="DM Mono" font-size="9.5">${gainGood ? "-12 dBFS GREEN ✓" : "STAGE GAIN FIRST"}</text>
                </g>
                <g class="hotspot ${!s.logicMuted ? "verified" : "fault"}" data-target="qs1_mute" data-tip-title="Master Output Mute Block" data-tip-body="Clear mute override using Mute Override tool.">
                  <rect class="hotspot-ring" x="285" y="110" width="185" height="165" rx="8"/>
                  <rect x="295" y="120" width="165" height="145" rx="6" fill="url(#brushedMetal)" stroke="#4e6d7e"/>
                  <text x="312" y="148" fill="#eef6f7" font-family="DM Mono" font-size="11">OUTPUT MUTE</text>
                  <rect x="312" y="170" width="130" height="40" rx="5" fill="${s.logicMuted ? "#5a252a" : "#1f4738"}" stroke="${s.logicMuted ? "#f27474" : "#72e6a4"}"/>
                  <text x="342" y="195" fill="${s.logicMuted ? "#ffd0d0" : "#72e6a4"}" font-family="DM Mono" font-weight="700" font-size="12">${s.logicMuted ? "MUTED" : "OPEN"}</text>
                </g>
                <g class="hotspot ${s.ampVerified ? "verified" : ""}" data-target="qs1_amp" data-tip-title="CX-Q 4K4 Network Amplifier" data-tip-body="Verify Q-LAN audio stream and 8Ω loudspeaker output with Amp Telemetry tool.">
                  <rect class="hotspot-ring" x="525" y="110" width="185" height="165" rx="8"/>
                  <rect x="535" y="120" width="165" height="145" rx="6" fill="url(#brushedMetal)" stroke="${s.ampVerified ? "#72e6a4" : "#486373"}"/>
                  <text x="552" y="148" fill="#5ce1cb" font-family="DM Mono" font-size="11">CX-Q 4K4 AMP</text>
                  <text x="552" y="178" fill="${!s.logicMuted ? "#72e6a4" : "#93a8ae"}" font-family="DM Mono" font-size="10">OUT: ${!s.logicMuted ? "ACTIVE (8Ω)" : "SILENT"}</text>
                  <text x="552" y="206" fill="${s.ampVerified ? "#72e6a4" : "#f5b963"}" font-family="DM Mono" font-size="9.5">${s.ampVerified ? "✓ VERIFIED" : "INSPECT AMP"}</text>
                </g>
              </svg>
            </div>
            ${renderToolDock()}
          </div>
          <div class="mentor-col"><div class="mentor-card">
            <div class="mentor-head"><div class="mentor-avatar">QSC</div><div><h3>Q-SYS Mentor</h3><div class="eyebrow" style="font-size:9.5px;">Q-SYS L1 • MODULE 01</div></div></div>
            <div class="mentor-msg ${s.mentorTone}">${s.mentorText}</div>
            <label class="field-lbl">MIC IN 1 GAIN: ${s.micGain > 0 ? "+"+s.micGain : s.micGain} dB</label>
            <input type="range" id="qs1-slider" min="-20" max="16" value="${s.micGain}" style="width:100%; accent-color:var(--teal);">
            <div class="checklist">
              <div class="chk-item ${s.gainStaged ? "done" : "current"}"><div class="chk-box">${s.gainStaged ? "✓" : "1"}</div><div>Set Gain (+3 to +9 dB) & validate with <b>Gain Tool</b>.</div></div>
              <div class="chk-item ${!s.logicMuted ? "done" : s.gainStaged ? "current" : ""}"><div class="chk-box">${!s.logicMuted ? "✓" : "2"}</div><div>Unmute <b>Output Block</b> with Mute Override tool.</div></div>
              <div class="chk-item ${s.ampVerified ? "done" : !s.logicMuted ? "current" : ""}"><div class="chk-box">${s.ampVerified ? "✓" : "3"}</div><div>Inspect <b>CX-Q 4K4 Amp</b> with Amp Telemetry tool.</div></div>
            </div>
          </div></div>
        </div>`;
    }
    if (lvl === 2) {
      const s = qs2, done = s.aecWired && s.erlTuned && s.duplexVerified;
      return `
        <div class="eyebrow">TRACK 05 // Q-SYS LEVEL 1 & 2 — MODULE 02</div>
        <h1>Acoustic Echo Cancellation (AEC) Reference & NLP Tuning</h1>
        ${renderTierSelector("qs")}
        <div class="work-order"><div><div class="eyebrow">TICKET DSP-212 • AEC CONFERENCING</div><p>Remote Zoom/Teams callers hear severe acoustic echo. Wire the <b>Far-End VoIP RX</b> pin to the <b>AEC Reference</b> pin, set NLP to <b>Medium</b>, and verify Echo Return Loss (ERL).</p></div><button class="btn secondary" data-reset-bench="qs_2">Reset Module</button></div>
        <div class="sim-layout">
          <div class="stage-card">
            <div class="stage-header"><div class="stage-title"><span class="pulse-dot ${done ? "" : "amber"}"></span>Q-SYS AEC ARCHITECTURE // DUPLEX CONFERENCING</div><span style="font:500 10.5px var(--mono); color:${done ? "var(--green)" : "var(--amber)"}">${s.pendingPin ? `PIN HELD: ${s.pendingPin} → CLICK TARGET PIN` : `ERL: ${s.aecWired ? "28 dB (CLEAN)" : "0 dB (ECHO!)"}`}</span></div>
            <div class="svg-viewport"><div class="svg-tooltip" id="svg-tip"></div>
              <svg viewBox="0 0 760 400" xmlns="http://www.w3.org/2000/svg">${SVG_DEFS}
                <rect x="16" y="14" width="728" height="372" rx="12" fill="url(#pcbDark)" stroke="#283c47" stroke-width="2"/>
                <g class="hotspot ${s.aecWired ? "verified" : "fault"}" data-target="qs2_aec" data-tip-title="AEC Processor — Reference Input Pin" data-tip-body="Click VoIP RX Out pin and AEC Reference pin with Schematic Wire, then tune NLP with AEC/NLP Tuner.">
                  <rect class="hotspot-ring" x="340" y="55" width="330" height="175" rx="8"/>
                  <rect x="350" y="65" width="310" height="155" rx="6" fill="url(#brushedMetal)" stroke="#4e6d7e"/>
                  <text x="370" y="94" fill="#6bb5ff" font-family="DM Mono" font-size="11">AEC PROCESSOR BLOCK</text>
                  <circle cx="350" cy="175" r="7" fill="${s.aecWired ? "#72e6a4" : "#f27474"}" stroke="#eef6f7" stroke-width="1.5"/>
                  <text x="366" y="179" fill="${s.aecWired ? "#72e6a4" : "#f27474"}" font-family="DM Mono" font-size="10">AEC REF PIN ${s.aecWired ? "(WIRED ✓)" : "(UNCONNECTED!)"}</text>
                  <text x="370" y="204" fill="#93a8ae" font-family="DM Mono" font-size="9.5">NLP AGGRESSION: ${s.nlpLevel}</text>
                </g>
                <g class="hotspot ${s.aecWired ? "verified" : "fault"}" data-target="qs2_voip" data-tip-title="USB / VoIP Softphone Far-End Receive" data-tip-body="Wire RX Out pin to AEC Reference pin with Schematic Wire.">
                  <rect class="hotspot-ring" x="55" y="210" width="225" height="135" rx="8"/>
                  <rect x="65" y="220" width="205" height="115" rx="6" fill="url(#brushedMetal)" stroke="#4c6878"/>
                  <text x="80" y="248" fill="#f5b963" font-family="DM Mono" font-size="11">VOIP FAR-END RX</text>
                  <circle cx="270" cy="285" r="7" fill="#5ce1cb" stroke="#eef6f7" stroke-width="1.5"/>
                  <text x="190" y="289" fill="#5ce1cb" font-family="DM Mono" font-size="9.5">RX OUT PIN</text>
                </g>
                ${s.aecWired ? `<path d="M 270 285 C 310 285, 310 175, 350 175" stroke="#72e6a4" stroke-width="3.5" fill="none" filter="url(#ledGlow)"/>` : ""}
              </svg>
            </div>
            ${renderToolDock()}
          </div>
          <div class="mentor-col"><div class="mentor-card">
            <div class="mentor-head"><div class="mentor-avatar">QSC</div><div><h3>Q-SYS Mentor</h3><div class="eyebrow" style="font-size:9.5px;">Q-SYS L1/2 • MODULE 02</div></div></div>
            <div class="mentor-msg ${s.mentorTone}">${s.mentorText}</div>
            <label class="field-lbl">NON-LINEAR PROCESSING (NLP)</label>
            <select class="select-ctrl" id="qs2-nlp"><option value="OFF" ${s.nlpLevel==="OFF"?"selected":""}>Disabled (Residual Echo)</option><option value="MEDIUM" ${s.nlpLevel==="MEDIUM"?"selected":""}>Medium (Optimal Duplex)</option></select>
            <div class="checklist">
              <div class="chk-item ${s.aecWired ? "done" : "current"}"><div class="chk-box">${s.aecWired ? "✓" : "1"}</div><div>Wire <b>VOIP RX OUT</b> → <b>AEC REF PIN</b>.</div></div>
              <div class="chk-item ${s.duplexVerified ? "done" : s.aecWired ? "current" : ""}"><div class="chk-box">${s.duplexVerified ? "✓" : "2"}</div><div>Set NLP to <b>Medium</b> & verify ERL with AEC Tuner.</div></div>
            </div>
          </div></div>
        </div>`;
    }
    if (lvl === 3) {
      const s = qs3, gainSafe = s.micGain >= 3 && s.micGain <= 9, done = s.gainFixed && s.limiterEngaged && s.ampModeFixed && s.ampVerified;
      return `
        <div class="eyebrow">TRACK 05 // Q-SYS LEVEL 2 — MODULE 03</div>
        <h1>70V High-Z Amplifier Over-Current & Gain Structure Forensics</h1>
        ${renderTierSelector("qs")}
        <div class="work-order"><div><div class="eyebrow">TICKET DSP-325 • 70V AMPLIFIER PROTECTION</div><p>Auditorium amplifier <b>CX-Q 4K4</b> trips into Over-Current Protect. Calibrate clipping preamp (+24 dB → +6 dB), engage +4 dBu Peak Limiter, switch Amp Ch 1 from Low-Z 4Ω to <b>70V High-Z + 80Hz HPF</b>, and verify load.</p></div><button class="btn secondary" data-reset-bench="qs_3">Reset Module</button></div>
        <div class="sim-layout">
          <div class="stage-card">
            <div class="stage-header"><div class="stage-title"><span class="pulse-dot ${done ? "" : "red"}"></span>CORE-110f DYNAMICS & CX-Q 4K4 AMPLIFIER</div><span style="font:500 10.5px var(--mono); color:${done ? "var(--green)" : "var(--red)"}">AMP FAULT: ${s.ampModeFixed ? "NONE (70V LINE NOMINAL)" : "OVER-CURRENT PROTECT!"}</span></div>
            <div class="svg-viewport"><div class="svg-tooltip" id="svg-tip"></div>
              <svg viewBox="0 0 760 400" xmlns="http://www.w3.org/2000/svg">${SVG_DEFS}
                <rect x="16" y="14" width="728" height="372" rx="12" fill="url(#pcbDark)" stroke="#283c47" stroke-width="2"/>
                <g class="hotspot ${s.gainFixed && s.limiterEngaged ? "verified" : "fault"}" data-target="qs3_dyn" data-tip-title="Preamp Gain & Peak Limiter Block" data-tip-body="Lower Mic Gain to +3..+9 dB and engage Peak Limiter below, then click with Gain & Limiter.">
                  <rect class="hotspot-ring" x="45" y="75" width="315" height="245" rx="8"/>
                  <rect x="55" y="85" width="295" height="225" rx="6" fill="url(#brushedMetal)" stroke="#4c6878"/>
                  <text x="72" y="114" fill="#5ce1cb" font-family="DM Mono" font-size="11">DSP INPUT & DYNAMICS</text>
                  <text x="72" y="144" fill="${gainSafe ? "#72e6a4" : "#f27474"}" font-family="DM Mono" font-size="10">PREAMP GAIN: ${s.micGain > 0 ? "+"+s.micGain : s.micGain} dB ${gainSafe ? "(NOMINAL)" : "(CLIPPING!)"}</text>
                  <text x="72" y="174" fill="${s.limiterActive ? "#72e6a4" : "#f5b963"}" font-family="DM Mono" font-size="10">PEAK LIMITER (+4 dBu): ${s.limiterActive ? "ACTIVE ✓" : "BYPASSED!"}</text>
                </g>
                <g class="hotspot ${s.ampVerified ? "verified" : "fault"}" data-target="qs3_amp" data-tip-title="CX-Q 4K4 Channel 1 Output Mode" data-tip-body="1) Set Amp Mode to 70V High-Z + 80Hz HPF below & apply with Amp Output Mode. 2) Verify with Amp Telemetry.">
                  <rect class="hotspot-ring" x="400" y="75" width="315" height="245" rx="8"/>
                  <rect x="410" y="85" width="295" height="225" rx="6" fill="url(#brushedMetal)" stroke="${s.ampVerified ? "#72e6a4" : "#f27474"}"/>
                  <text x="428" y="114" fill="#6bb5ff" font-family="DM Mono" font-size="11">CX-Q 4K4 // CHANNEL 1</text>
                  <text x="428" y="144" fill="${s.ampModeFixed ? "#72e6a4" : "#f27474"}" font-family="DM Mono" font-size="10">MODE: ${s.ampModeFixed ? "70V HIGH-Z + 80Hz HPF" : "LOW-Z 4Ω (SATURATING!)"}</text>
                  <text x="428" y="174" fill="${s.ampVerified ? "#72e6a4" : "#93a8ae"}" font-family="DM Mono" font-size="10">LOAD: ${s.ampVerified ? "48 Ω (100W 70V LINE OK)" : "SHORT / OVER-CURRENT"}</text>
                </g>
              </svg>
            </div>
            ${renderToolDock()}
          </div>
          <div class="mentor-col"><div class="mentor-card">
            <div class="mentor-head"><div class="mentor-avatar">QSC</div><div><h3>Q-SYS Mentor</h3><div class="eyebrow" style="font-size:9.5px;">Q-SYS L2 • MODULE 03</div></div></div>
            <div class="mentor-msg ${s.mentorTone}">${s.mentorText}</div>
            <label class="field-lbl">MIC PREAMP GAIN: ${s.micGain > 0 ? "+"+s.micGain : s.micGain} dB</label>
            <input type="range" id="qs3-slider" min="-12" max="24" value="${s.micGain}" style="width:100%; accent-color:var(--teal);">
            <label class="field-lbl">PEAK LIMITER</label>
            <select class="select-ctrl" id="qs3-lim"><option value="false" ${!s.limiterActive?"selected":""}>Bypassed</option><option value="true" ${s.limiterActive?"selected":""}>Engaged (+4 dBu Ceiling)</option></select>
            <label class="field-lbl">CX-Q CH 1 OUTPUT CONFIGURATION</label>
            <select class="select-ctrl" id="qs3-mode"><option value="LOW_Z_4OHM" ${s.ampMode==="LOW_Z_4OHM"?"selected":""}>Low-Z 4Ω (No HPF)</option><option value="HIGH_Z_70V" ${s.ampMode==="HIGH_Z_70V"?"selected":""}>70V High-Z + 80Hz HPF</option></select>
            <div class="checklist">
              <div class="chk-item ${s.gainFixed && s.limiterEngaged ? "done" : "current"}"><div class="chk-box">${s.gainFixed && s.limiterEngaged ? "✓" : "1"}</div><div>Stage Gain (+3..+9 dB) & engage <b>Peak Limiter</b>.</div></div>
              <div class="chk-item ${s.ampModeFixed ? "done" : s.gainFixed && s.limiterEngaged ? "current" : ""}"><div class="chk-box">${s.ampModeFixed ? "✓" : "2"}</div><div>Switch Amp Ch 1 to <b>70V High-Z + 80Hz HPF</b>.</div></div>
              <div class="chk-item ${s.ampVerified ? "done" : s.ampModeFixed ? "current" : ""}"><div class="chk-box">${s.ampVerified ? "✓" : "3"}</div><div>Verify 70V line load with <b>Amp Telemetry</b>.</div></div>
            </div>
          </div></div>
        </div>`;
    }
    // Module 4: Q-SYS Level 2 Enterprise Control (NC Fire-Alarm GPIO, UCI Deployment & Q-LAN PTPv2)
    const s = qs4, done = s.gpioWired && s.uciDeployed && s.ptpSynced;
    return `
      <div class="eyebrow">TRACK 05 // Q-SYS LEVEL 2 CONTROL & LIFE SAFETY — MODULE 04</div>
      <h1>Fail-Safe NC Fire-Alarm GPIO, Touch Panel UCI & Q-LAN PTPv2</h1>
      ${renderTierSelector("qs")}
      <div class="work-order"><div><div class="eyebrow">TICKET DSP-408 • LIFE SAFETY & UCI</div><p>Commission the facility control system: (1) Wire the fail-safe <b>Normally-Closed (NC) Fire Alarm GPIO</b> to Emergency Mute, (2) Deploy the <b>Room Control UCI</b> to touch panel TSC-70, and (3) Audit Q-LAN PTPv2 clock lock.</p></div><button class="btn secondary" data-reset-bench="qs_4">Reset Module</button></div>
      <div class="sim-layout">
        <div class="stage-card">
          <div class="stage-header"><div class="stage-title"><span class="pulse-dot ${done ? "" : "amber"}"></span>CORE-110f GPIO LIFE-SAFETY & TSC-70 UCI</div><span style="font:500 10.5px var(--mono); color:${done ? "var(--green)" : "var(--amber)"}">COMMISSIONING: ${done ? "LIFE-SAFETY & UCI CERTIFIED ✓" : "PENDING SIGN-OFF"}</span></div>
          <div class="svg-viewport"><div class="svg-tooltip" id="svg-tip"></div>
            <svg viewBox="0 0 760 400" xmlns="http://www.w3.org/2000/svg">${SVG_DEFS}
              <rect x="16" y="14" width="728" height="372" rx="12" fill="url(#pcbDark)" stroke="#283c47" stroke-width="2"/>
              <g class="hotspot ${s.gpioWired ? "verified" : "fault"}" data-target="qs4_gpio" data-tip-title="Fail-Safe NC Fire Alarm GPIO Input" data-tip-body="Select NC Fire-Alarm Supervised below & wire with GPIO Life-Safety Wire.">
                <rect class="hotspot-ring" x="45" y="65" width="215" height="260" rx="8"/>
                <rect x="55" y="75" width="195" height="240" rx="6" fill="url(#brushedMetal)" stroke="${s.gpioWired ? "#72e6a4" : "#f27474"}"/>
                <text x="72" y="104" fill="#f27474" font-family="DM Mono" font-size="11">1. GPIO FIRE RELAY</text>
                <text x="72" y="132" fill="#eef6f7" font-family="DM Mono" font-size="9.5">MODE: ${s.gpioWired ? "NC FAIL-SAFE MUTE ✓" : "UNWIRED / BYPASSED"}</text>
              </g>
              <g class="hotspot ${s.uciDeployed ? "verified" : "fault"}" data-target="qs4_uci" data-tip-title="Q-SYS TSC-70 Touch Panel UCI" data-tip-body="Select Auditorium_Main UCI below & push with UCI Deployer.">
                <rect class="hotspot-ring" x="280" y="65" width="215" height="260" rx="8"/>
                <rect x="290" y="75" width="195" height="240" rx="6" fill="url(#brushedMetal)" stroke="${s.uciDeployed ? "#72e6a4" : "#f5b963"}"/>
                <text x="306" y="104" fill="#5ce1cb" font-family="DM Mono" font-size="11">2. TSC-70 TOUCH UI</text>
                <text x="306" y="132" fill="#eef6f7" font-family="DM Mono" font-size="9.5">UCI: ${s.uciDeployed ? "AUDITORIUM_MAIN ✓" : "NO UCI ASSIGNED"}</text>
              </g>
              <g class="hotspot ${s.ptpSynced ? "verified" : "fault"}" data-target="qs4_ptp" data-tip-title="Q-LAN PTPv2 Synchronization Audit" data-tip-body="Verify Q-LAN audio clock lock with Q-LAN PTP Verifier.">
                <rect class="hotspot-ring" x="515" y="65" width="205" height="260" rx="8"/>
                <rect x="525" y="75" width="185" height="240" rx="6" fill="url(#brushedMetal)" stroke="${s.ptpSynced ? "#72e6a4" : "#4b6778"}"/>
                <text x="542" y="104" fill="#6bb5ff" font-family="DM Mono" font-size="11">3. Q-LAN PTPv2</text>
                <text x="542" y="132" fill="${s.ptpSynced ? "#72e6a4" : "#93a8ae"}" font-family="DM Mono" font-size="9.5">${s.ptpSynced ? "✓ GRANDMASTER LOCKED" : "AUDIT PTP SYNC"}</text>
              </g>
            </svg>
          </div>
          ${renderToolDock()}
        </div>
        <div class="mentor-col"><div class="mentor-card">
          <div class="mentor-head"><div class="mentor-avatar">QSC</div><div><h3>Control Mentor</h3><div class="eyebrow" style="font-size:9.5px;">Q-SYS L2 • MODULE 04</div></div></div>
          <div class="mentor-msg ${s.mentorTone}">${s.mentorText}</div>
          <label class="field-lbl">FIRE ALARM GPIO SUPERVISION</label>
          <select class="select-ctrl" id="qs4-gpio"><option value="NO_FAULT" ${s.gpioLogic==="NO_FAULT"?"selected":""}>Normally-Open (Not Fail-Safe)</option><option value="NC_FAILSAFE" ${s.gpioLogic==="NC_FAILSAFE"?"selected":""}>Normally-Closed (NC Fail-Safe)</option></select>
          <label class="field-lbl">TSC-70 PANEL UCI ASSIGNMENT</label>
          <select class="select-ctrl" id="qs4-uci"><option value="UNASSIGNED" ${s.uciPage==="UNASSIGNED"?"selected":""}>Unassigned</option><option value="AUDITORIUM_MAIN" ${s.uciPage==="AUDITORIUM_MAIN"?"selected":""}>Auditorium_Main.uci</option></select>
          <div class="checklist">
            <div class="chk-item ${s.gpioWired ? "done" : "current"}"><div class="chk-box">${s.gpioWired ? "✓" : "1"}</div><div>Wire <b>NC Fire-Alarm GPIO</b> with GPIO Life-Safety Wire.</div></div>
            <div class="chk-item ${s.uciDeployed ? "done" : s.gpioWired ? "current" : ""}"><div class="chk-box">${s.uciDeployed ? "✓" : "2"}</div><div>Deploy <b>Auditorium_Main UCI</b> with UCI Deployer.</div></div>
            <div class="chk-item ${s.ptpSynced ? "done" : s.uciDeployed ? "current" : ""}"><div class="chk-box">${s.ptpSynced ? "✓" : "3"}</div><div>Audit clock lock with <b>Q-LAN PTP Verifier</b>.</div></div>
          </div>
        </div></div>
      </div>`;
  }

  /* ==========================================================================
     14. GLOSSARY & 20-QUESTION MASTERY EXAM RENDERERS
     ========================================================================== */
  let glossaryFilter = "";
  function renderGlossary() {
    const filtered = glossaryTerms.filter(item =>
      item.term.toLowerCase().includes(glossaryFilter) ||
      item.domain.toLowerCase().includes(glossaryFilter) ||
      item.def.toLowerCase().includes(glossaryFilter)
    );
    return `
      <div class="eyebrow">ENGINEERING REFERENCE MANUAL // ALL 20 MODULES</div>
      <h1>Comprehensive IT & AV Certification Glossary</h1>
      <p class="lead">Search protocols, hexadecimal POST codes, acoustic formulas, and switching rules across all five certification tracks.</p>
      <input class="search-input" id="gloss-search" type="search" placeholder="Search terms (e.g., BitLocker, OSPF, AES67, Inverse Square, NC GPIO)..." value="${glossaryFilter}">
      <div class="glossary-grid">
        ${filtered.map(g => `<div class="gloss-item"><div class="term"><span>${g.term}</span></div><div class="domain">${g.domain}</div><p>${g.def}</p></div>`).join("")}
      </div>
    `;
  }

  function renderExam() {
    if (examState.finished) {
      const pct = Math.round((examState.score / examQuestions.length) * 100);
      return `
        <div class="eyebrow">20-QUESTION CERTIFICATION ASSESSMENT COMPLETE</div>
        <h1>Mastery Score: ${pct}% (${examState.score}/${examQuestions.length})</h1>
        <div class="mentor-card" style="max-width:680px; margin-top:16px;">
          <div class="mentor-msg ${pct >= 80 ? "good" : "warn"}">
            ${pct >= 80 ? "Mastery achieved! You demonstrated multi-domain field readiness across all five certification tracks." : "Review missed objectives on the workbenches and Engineering Reference Manual, then retake the 20-question exam."}
          </div>
          <div class="ctrl-row">
            <button class="btn" id="exam-restart">Retake 20-Q Exam</button>
            <button class="btn secondary" data-nav="overview">Return to Dispatch</button>
          </div>
        </div>`;
    }
    const q = examQuestions[examState.idx];
    return `
      <div class="eyebrow">MASTERY EXAM // QUESTION ${examState.idx + 1} OF ${examQuestions.length}</div>
      <h1>Multi-Domain Certification Assessment</h1>
      <div class="mentor-card" style="max-width:780px; margin-top:14px;">
        <div class="bench-badge" style="display:inline-block; margin-bottom:10px;">${q.domain}</div>
        <h2 style="line-height:1.45;">${q.q}</h2>
        <div style="margin-top:12px;">
          ${q.options.map((opt, i) => {
            let cls = "choice-btn";
            if (examState.answered) {
              if (i === q.ans) cls += " correct";
              else if (i === examState.picked) cls += " wrong";
            }
            return `<button class="${cls}" data-exam-opt="${i}" ${examState.answered ? "disabled" : ""}><b>${String.fromCharCode(65+i)}.</b> ${opt}</button>`;
          }).join("")}
        </div>
        ${examState.answered ? `
          <div class="mentor-msg ${examState.picked === q.ans ? "good" : "bad"}" style="margin-top:12px;"><strong>${examState.picked === q.ans ? "Correct:" : "Incorrect:"}</strong> ${q.exp}</div>
          <div class="ctrl-row"><button class="btn" id="exam-next">${examState.idx + 1 === examQuestions.length ? "View Final Score →" : "Next Question →"}</button></div>
        ` : ""}
      </div>`;
  }

  /* ==========================================================================
     15. UNIFIED POINT-AND-CLICK DISPATCH HANDLER (ALL 20 MODULES)
     ========================================================================== */
  function handleHotspotClick(target) {
    // --- TRACK 01: COMPTIA A+ ---
    if (target.startsWith("pc1_")) {
      const s = pc1;
      if (target === "pc1_esd") {
        if (selectedTool === "esd") { s.esdAttached = true; s.mentorTone = "good"; s.mentorText = "ESD wrist strap bonded! Now probe PSU rails with Fluke Multimeter."; recordAction(true); }
        else { s.mentorTone = "warn"; s.mentorText = "Select ESD Wrist Strap first."; recordAction(false); }
      } else if (!s.esdAttached) { s.mentorTone = "bad"; s.mentorText = "SAFETY FLAG: Bond ESD Wrist Strap to bare steel before touching hardware!"; recordAction(false); }
      else if (target === "pc1_psu") {
        if (selectedTool === "dmm") { s.psuChecked = true; s.mentorTone = "good"; s.mentorText = "PSU +12.04V, +5.01V, +3.31V rails healthy. Next, decode Q-Code 55."; s.lastReading = "DMM: +12.04V | +5.01V | +3.31V — ALL RAILS IN SPEC"; recordAction(true); }
        else { s.mentorTone = "warn"; s.mentorText = "Use Fluke Multimeter to measure PSU rails."; recordAction(false); }
      } else if (target === "pc1_post") {
        if (selectedTool === "post") { s.postRead = true; s.mentorTone = "good"; s.mentorText = "Q-Code 55 decoded: Memory Initialization Failure. Latch DDR5 DIMM B2 with Anti-Static Hand."; s.lastReading = "Q-CODE 55: Memory Initialization Error (Slot B2)"; recordAction(true); }
        else { s.mentorTone = "warn"; s.mentorText = "Select POST LED Probe to read error code."; recordAction(false); }
      } else if (target === "pc1_ram") {
        if (selectedTool === "hand" && s.postRead) { s.ramReseated = true; s.mentorTone = "good"; s.mentorText = "DDR5 DIMM B2 latched! Cycle Power / Display to verify POST A0."; recordAction(true); }
        else { s.mentorTone = "warn"; s.mentorText = "Read Q-Code 55 first, then use Anti-Static Hand on DIMM B2."; recordAction(false); }
      } else if (target === "pc1_pwr") {
        if (selectedTool === "power" && s.ramReseated) { s.bootVerified = true; s.mentorTone = "good"; s.mentorText = "POST A0 complete and DisplayPort video active! Module 01 cleared!"; s.lastReading = "Q-CODE A0: Boot Hand-Off Complete"; recordAction(true, "pc_1"); }
        else { s.mentorTone = "warn"; s.mentorText = "Complete memory reseating and use Power / Display tool."; recordAction(false); }
      }
      render(); return;
    }

    if (target.startsWith("pc2_")) {
      const s = pc2;
      if (target === "pc2_esd") {
        if (selectedTool === "esd") { s.esdAttached = true; s.mentorTone = "good"; s.mentorText = "ESD bonded! Probe Fan/Pump Header with HWMonitor."; recordAction(true); }
        else { s.mentorTone = "warn"; s.mentorText = "Select ESD Wrist Strap first."; recordAction(false); }
      } else if (!s.esdAttached) { s.mentorTone = "bad"; s.mentorText = "SAFETY FLAG: Bond ESD Wrist Strap before servicing cooling hardware!"; recordAction(false); }
      else if (target === "pc2_sens") {
        if (selectedTool === "thermal") { s.telemetryRead = true; s.mentorTone = "good"; s.mentorText = "AIO pump spinning at 2850 RPM (healthy)—102°C spike is caused by choked intake filter and dried TIM. Vacuum front dust mesh next."; recordAction(true); }
        else { s.mentorTone = "warn"; s.mentorText = "Select HWMonitor Probe to inspect pump RPM and temps."; recordAction(false); }
      } else if (target === "pc2_filter") {
        if (selectedTool === "air" && s.telemetryRead) { s.filterCleaned = true; s.mentorTone = "good"; s.mentorText = "Intake mesh cleared (98% airflow)! Strip dried paste off CPU IHS with 99% Isopropyl."; recordAction(true); }
        else { s.mentorTone = "warn"; s.mentorText = "Inspect telemetry first, then clean mesh with HEPA Vacuum/Air."; recordAction(false); }
      } else if (target === "pc2_cpu") {
        if (selectedTool === "iso" && s.filterCleaned) { s.pasteCleaned = true; s.mentorTone = "good"; s.mentorText = "CPU IHS clean! Apply fresh Thermal Compound and mount AIO coldplate."; recordAction(true); }
        else if (selectedTool === "paste" && s.pasteCleaned) { s.pasteApplied = true; s.coolerMounted = true; s.mentorTone = "good"; s.mentorText = "Fresh TIM applied and AIO mounted! CPU temp dropped to 44°C. Module 02 cleared!"; s.lastReading = "CPU PKG TEMP: 44°C IDLE / 68°C LOAD — NOMINAL"; recordAction(true, "pc_2"); }
        else { s.mentorTone = "warn"; s.mentorText = "Clean filter → scrub old paste with 99% Isopropyl → apply Thermal Compound."; recordAction(false); }
      }
      render(); return;
    }

    if (target.startsWith("pc3_")) {
      const s = pc3;
      if (target === "pc3_esd") {
        if (selectedTool === "esd") { s.esdAttached = true; s.mentorTone = "good"; s.mentorText = "ESD grounded! Probe Modular PSU under load with Load Multimeter."; recordAction(true); }
        else { s.mentorTone = "warn"; s.mentorText = "Select ESD Wrist Strap first."; recordAction(false); }
      } else if (!s.esdAttached) { s.mentorTone = "bad"; s.mentorText = "SAFETY FLAG: Bond ESD Wrist Strap before probing rails!"; recordAction(false); }
      else if (target === "pc3_psu") {
        if (selectedTool === "dmm") { s.railsProbed = true; s.mentorTone = "warn"; s.mentorText = "+12V Rail A drooping to 11.18V (<11.40V ATX min)! Swap to Modular PSU Rail B."; recordAction(true); }
        else if (selectedTool === "cable" && s.railsProbed) { s.railSwapped = true; s.mentorTone = "good"; s.mentorText = "Swapped to Modular Rail B (12.02V)! Install missing M.2 Thermal Pad on NVMe slot."; recordAction(true); }
        else { s.mentorTone = "warn"; s.mentorText = "Probe with Load Multimeter first, then swap with Modular PSU Rail."; recordAction(false); }
      } else if (target === "pc3_nvme") {
        if (selectedTool === "pad" && s.railSwapped) { s.padFixed = true; s.mentorTone = "good"; s.mentorText = "M.2 Thermal Pad installed (48°C)! Reseat NVMe SSD with Anti-Static Hand."; recordAction(true); }
        else if (selectedTool === "hand" && s.padFixed) { s.nvmeReseated = true; s.mentorTone = "good"; s.mentorText = "NVMe SSD locked! Verify Windows Boot Manager in UEFI BIOS."; recordAction(true); }
        else { s.mentorTone = "warn"; s.mentorText = "Stabilize PSU rail → install M.2 Thermal Pad → reseat NVMe with Anti-Static Hand."; recordAction(false); }
      } else if (target === "pc3_bios") {
        if (selectedTool === "hand" && s.nvmeReseated) { s.biosVerified = true; s.mentorTone = "good"; s.mentorText = "UEFI Boot Manager verified and zero WHEA BSODs! Module 03 cleared!"; s.lastReading = "UEFI BOOT: NVMe_0 OK | +12V: 12.02V | M.2: 48°C"; recordAction(true, "pc_3"); }
        else { s.mentorTone = "warn"; s.mentorText = "Complete hardware repairs first, then verify UEFI BIOS with Anti-Static Hand."; recordAction(false); }
      }
      render(); return;
    }

    if (target.startsWith("pc4_")) {
      const s = pc4;
      if (target === "pc4_esd") {
        if (selectedTool === "esd") { s.esdAttached = true; s.mentorTone = "good"; s.mentorText = "ESD bonded! Reseat the 14-pin SPI dTPM 2.0 module with Anti-Static Hand."; recordAction(true); }
        else { s.mentorTone = "warn"; s.mentorText = "Select ESD Wrist Strap first."; recordAction(false); }
      } else if (!s.esdAttached) { s.mentorTone = "bad"; s.mentorText = "SAFETY FLAG: Bond ESD Wrist Strap before handling the dTPM 2.0 chip!"; recordAction(false); }
      else if (target === "pc4_tpm") {
        if (selectedTool === "hand") { s.tpmReseated = true; s.mentorTone = "good"; s.mentorText = "dTPM 2.0 seated! Enable TPM 2.0 & Secure Boot below, then click UEFI Setup with UEFI Firmware Key."; recordAction(true); }
        else { s.mentorTone = "warn"; s.mentorText = "Use Anti-Static Hand to reseat the dTPM 2.0 module."; recordAction(false); }
      } else if (target === "pc4_uefi") {
        if (selectedTool === "uefi" && s.tpmReseated) {
          s.tpmState = document.getElementById("pc4-tpm").value;
          s.secureBoot = document.getElementById("pc4-sb").value;
          if (s.tpmState === "ON" && s.secureBoot === "ENABLED") {
            s.biosConfigured = true; s.mentorTone = "good"; s.mentorText = "TPM 2.0 and UEFI Secure Boot enabled! Now click the BitLocker Recovery screen with the BitLocker Key tool.";
            s.lastReading = "TPM 2.0: READY | SECURE BOOT: ON | ENTER RECOVERY KEY"; recordAction(true);
          } else { s.mentorTone = "bad"; s.mentorText = "Set both TPM 2.0 = Enabled and Secure Boot = Enabled first!"; recordAction(false); }
        } else { s.mentorTone = "warn"; s.mentorText = "Reseat dTPM 2.0 first, then configure UEFI with UEFI Firmware Key."; recordAction(false); }
      } else if (target === "pc4_bitlocker") {
        if (selectedTool === "bitlocker" && s.biosConfigured) {
          s.bitlockerUnlocked = true; s.mentorTone = "good"; s.mentorText = "48-digit BitLocker key accepted—Volume C: unlocked and Windows 11 booted! CompTIA A+ Track Certified!";
          s.lastReading = "BITLOCKER: UNLOCKED | TPM 2.0 PCR ATTESTATION VALID"; recordAction(true, "pc_4");
        } else { s.mentorTone = "warn"; s.mentorText = "Enable TPM 2.0 & Secure Boot in UEFI first, then use BitLocker Key."; recordAction(false); }
      }
      render(); return;
    }

    // --- TRACK 02: COMPTIA NETWORK+ ---
    if (target.startsWith("net1_")) {
      const s = net1;
      if (target === "net1_drop") {
        if (selectedTool === "toner") { playTone("toner"); s.dropTraced = true; s.mentorTone = "good"; s.mentorText = "Toner detected on Patch Panel Port 07! Patch PP-07 to Switch Gi0/7 using Cat6 Patch Cord."; s.cliLog = "TONER TRACE: Drop D-14 -> Patch Panel PP-07"; recordAction(true); }
        else if (selectedTool === "ping") {
          if (s.vlanFixed && s.patchedPort7) { s.pingVerified = true; s.mentorTone = "good"; s.mentorText = "DHCP lease 10.10.10.42 acquired and gateway ping <1ms! Module 01 cleared!"; s.cliLog = "Reply from 10.10.10.1: bytes=32 time<1ms TTL=64"; recordAction(true, "network_1"); }
          else { s.mentorTone = "bad"; s.mentorText = "Ping failed (APIPA 169.254.x.x). Finish patching and VLAN 10 assignment first."; recordAction(false); }
        } else { s.mentorTone = "warn"; s.mentorText = "Use Fluke Toner/Probe on Wall Drop D-14 first."; recordAction(false); }
      } else if (target === "net1_console") {
        if (selectedTool === "console") { s.cliInspected = true; s.mentorTone = "good"; s.mentorText = "CLI connected! Gi0/7 is stuck in VLAN 999. Reassign Gi0/7 to VLAN 10 below."; s.cliLog = "SW-IDF-02# show vlan brief\n10  STAFF    active  Gi0/1-3\n999 PARKING  active  Gi0/7 <-- ISOLATED"; recordAction(true); }
        else { s.mentorTone = "warn"; s.mentorText = "Select RJ45 Console cable to inspect switch."; recordAction(false); }
      } else if (target.startsWith("net1_pp_") || target.startsWith("net1_sw_")) {
        if (selectedTool === "patch" && s.dropTraced) {
          if (target === "net1_pp_7" || target === "net1_sw_7") {
            if (!s.pendingPatchFrom) { s.pendingPatchFrom = target; s.mentorText = "Cord attached—click the matching port (PP-07 ↔ Gi0/7)."; }
            else if (s.pendingPatchFrom !== target) { s.patchedPort7 = true; s.pendingPatchFrom = null; s.mentorTone = "good"; s.mentorText = "Patched PP-07 to Gi0/7! Connect RJ45 Console cable to check VLANs."; recordAction(true); }
          } else { s.mentorTone = "bad"; s.mentorText = "Wrong port! Toner indicated Port 07."; recordAction(false); }
        } else { s.mentorTone = "warn"; s.mentorText = "Tone out Drop D-14 first, then use Cat6 Patch Cord on Port 07."; recordAction(false); }
      }
      render(); return;
    }

    if (target.startsWith("net2_")) {
      const s = net2;
      if (target === "net2_sw") {
        if (selectedTool === "console") { s.cliInspected = true; s.mentorTone = "warn"; s.mentorText = "Trunk Te1/1 omits VLAN 20 and Native VLAN is 1 (Core is 99). Select 10,20,99 and Native 99, then click Trunk Te1/1 with IOS Trunk Config."; s.cliLog = "SW-01# show interfaces trunk\nTe1/1  on  802.1q  trunking  native 1 (MISMATCH)\nAllowed: 10,99"; recordAction(true); }
        else { s.mentorTone = "warn"; s.mentorText = "Select RJ45 Console cable to inspect SW-01."; recordAction(false); }
      } else if (target === "net2_trunk") {
        if (selectedTool === "cli" && s.cliInspected) {
          s.allowedVal = document.getElementById("net2-allowed").value;
          s.nativeVal = document.getElementById("net2-native").value;
          if (s.allowedVal === "10,20,99" && s.nativeVal === "99") { s.allowedFixed = true; s.nativeFixed = true; s.mentorTone = "good"; s.mentorText = "Trunk Te1/1 updated! Run DHCP/ICMP Tester on VLAN 20 AV Endpoint."; s.cliLog = "SW-01(config-if)# switchport trunk allowed vlan 10,20,99\nSW-01(config-if)# switchport trunk native vlan 99"; recordAction(true); }
          else { s.mentorTone = "bad"; s.mentorText = "Allow 10,20,99 and match Native VLAN 99!"; recordAction(false); }
        } else { s.mentorTone = "warn"; s.mentorText = "Inspect SW-01 console first, then use IOS Trunk Config on Te1/1."; recordAction(false); }
      } else if (target === "net2_endpoint") {
        if (selectedTool === "ping" && s.allowedFixed && s.nativeFixed) { s.dhcpVerified = true; s.mentorTone = "good"; s.mentorText = "VLAN 20 endpoint reached 10.20.0.1! Module 02 cleared!"; s.cliLog = "PING 10.20.0.1: 64 bytes icmp_seq=1 ttl=255 time=0.41 ms"; recordAction(true, "network_2"); }
        else { s.mentorTone = "warn"; s.mentorText = "Fix Trunk Te1/1 first, then use DHCP/ICMP Tester."; recordAction(false); }
      }
      render(); return;
    }

    if (target.startsWith("net3_")) {
      const s = net3;
      if (target === "net3_console") {
        if (selectedTool === "console") { s.stpInspected = true; s.mentorTone = "warn"; s.mentorText = "STP shows rogue switch loop on Gi0/12, and Gi0/4 is err-disabled. Enable BPDU Guard on Gi0/12 first!"; s.cliLog = "SW-IDF-02# show interfaces status\nGi0/4   err-disabled   10   auto\nGi0/12  connected      10   (BPDU TCN FLOOD)"; recordAction(true); }
        else { s.mentorTone = "warn"; s.mentorText = "Select RJ45 Console cable to inspect STP."; recordAction(false); }
      } else if (target === "net3_gi12") {
        if (selectedTool === "bpdu" && s.stpInspected) { s.bpduGuardEnabled = true; s.mentorTone = "good"; s.mentorText = "BPDU Guard tripped Gi0/12 into safe err-disabled—CPU dropped to 6%! Now bounce Gi0/4 with Port Bounce Tool."; s.cliLog = "%SPANTREE-2-BLOCK_BPDUGUARD: Received BPDU on Gi0/12. Disabling."; recordAction(true); }
        else { s.mentorTone = "warn"; s.mentorText = "Inspect CLI first, then use BPDU Guard Tool on Gi0/12."; recordAction(false); }
      } else if (target === "net3_gi4") {
        if (selectedTool === "recover" && s.bpduGuardEnabled) { s.portCleared = true; s.mentorTone = "good"; s.mentorText = "Gi0/4 bounced (`shutdown` / `no shutdown`) and UP! Verify 0% packet loss with Packet Analyzer."; s.cliLog = "SW-IDF-02(config-if)# shut\nSW-IDF-02(config-if)# no shut\n%LINK-3-UPDOWN: Gi0/4 changed state to up"; recordAction(true); }
        else if (selectedTool === "ping" && s.portCleared) { s.pingVerified = true; s.mentorTone = "good"; s.mentorText = "0% packet loss verified across switch fabric! Module 03 cleared!"; recordAction(true, "network_3"); }
        else { s.mentorTone = "warn"; s.mentorText = "Stop the loop on Gi0/12 → bounce Gi0/4 → verify with Packet Analyzer."; recordAction(false); }
      }
      render(); return;
    }

    if (target.startsWith("net4_")) {
      const s = net4;
      if (target === "net4_r1") {
        if (selectedTool === "console") { s.ospfInspected = true; s.mentorTone = "warn"; s.mentorText = "R1 Gi0/0 is in OSPF Area 10 (Core R0 is Area 0), and ACL-WAN-IN blocks TCP 443. Select Area 0 & Permit TCP 443 below, then apply tools."; s.cliLog = "R1# show ip ospf neighbor -> (EMPTY)\n%OSPF-4-ERRRCV: Area mismatch 0.0.0.10 vs 0.0.0.0\nR1# show access-lists -> 10 deny tcp any any eq 443 (418 matches)"; recordAction(true); }
        else if (selectedTool === "ospf" && s.ospfInspected) {
          s.ospfArea = document.getElementById("net4-area").value;
          if (s.ospfArea === "0") { s.ospfFixed = true; s.mentorTone = "good"; s.mentorText = "OSPF Area 0 matched—neighbor adjacency reached FULL/DR! Now apply ACL Policy Editor on ACL-WAN-IN."; s.cliLog = "%OSPF-5-ADJCHG: Process 1, Nbr 10.0.0.1 on Gi0/0 from LOADING to FULL"; recordAction(true); }
          else { s.mentorTone = "bad"; s.mentorText = "Select Area 0 (Backbone Matched) first!"; recordAction(false); }
        } else { s.mentorTone = "warn"; s.mentorText = "Inspect R1 with Router Console first, then apply OSPF Area Tool."; recordAction(false); }
      } else if (target === "net4_acl") {
        if (selectedTool === "acl" && s.ospfFixed) {
          s.aclRule = document.getElementById("net4-acl").value;
          if (s.aclRule === "PERMIT_443") { s.aclFixed = true; s.mentorTone = "good"; s.mentorText = "ACL-WAN-IN updated to permit TCP 443! Verify end-to-end reachability with WAN Probe."; s.cliLog = "R1(config-ext-nacl)# 10 permit tcp any any eq 443"; recordAction(true); }
          else { s.mentorTone = "bad"; s.mentorText = "Select `permit tcp any any eq 443` first!"; recordAction(false); }
        } else { s.mentorTone = "warn"; s.mentorText = "Fix OSPF Area 0 first, then use ACL Policy Editor."; recordAction(false); }
      } else if (target === "net4_wan") {
        if (selectedTool === "ping" && s.aclFixed) { s.wanVerified = true; s.mentorTone = "good"; s.mentorText = "OSPF route learned and HTTPS 443 telemetry verified! CompTIA Network+ Track Certified!"; s.cliLog = "HTTPS 200 OK -> 198.51.100.44:443 (RTT 11.4ms)"; recordAction(true, "network_4"); }
        else { s.mentorTone = "warn"; s.mentorText = "Complete OSPF & ACL fixes first, then click with WAN Probe."; recordAction(false); }
      }
      render(); return;
    }

    // --- TRACK 03: AUDINATE DANTE ---
    if (target.startsWith("dante1_")) {
      const s = dante1;
      if (target === "dante1_dev") {
        if (selectedTool === "clock") {
          s.txRate = document.getElementById("d1-tx").value;
          s.rxRate = document.getElementById("d1-rx").value;
          if (s.txRate === "48" && s.rxRate === "48") { s.sampleRateSynced = true; s.mentorTone = "good"; s.mentorText = "Both devices locked at 48 kHz! Subscribe TX 01 → RX 01 and TX 02 → RX 02 with Dante Matrix Tool."; recordAction(true); }
          else { s.mentorTone = "bad"; s.mentorText = "Set both Stagebox and DSP to 48 kHz first!"; recordAction(false); }
        } else { s.mentorTone = "warn"; s.mentorText = "Use Dante Clock/Rate tool after setting 48 kHz."; recordAction(false); }
      } else if (target === "dante1_ch1" || target === "dante1_ch2") {
        if (selectedTool === "route" && s.sampleRateSynced) {
          if (target === "dante1_ch1") s.routedCh1 = true;
          if (target === "dante1_ch2") s.routedCh2 = true;
          if (s.routedCh1 && s.routedCh2) { s.mentorTone = "good"; s.mentorText = "Green checkmarks active—Dante audio flowing at 48 kHz! Module 01 cleared!"; recordAction(true, "dante_1"); }
          else { s.mentorTone = "good"; s.mentorText = "Channel subscribed! Subscribe the remaining channel."; recordAction(true); }
        } else { s.mentorTone = "warn"; s.mentorText = "Sync both devices to 48 kHz first, then use Dante Matrix Tool."; recordAction(false); }
      }
      render(); return;
    }

    if (target.startsWith("dante2_")) {
      const s = dante2;
      if (target === "dante2_sw") {
        if (selectedTool === "switchui") { s.eeeDisabled = true; s.mentorTone = "good"; s.mentorText = "802.3az EEE disabled! Set Preferred Leader = DSP-CORE-01 and External Sync = OFF, then click Clock Status with PTPv2 Clock Tool."; recordAction(true); }
        else { s.mentorTone = "warn"; s.mentorText = "Select Switch Config tool to disable EEE."; recordAction(false); }
      } else if (target === "dante2_clock") {
        if (selectedTool === "clock" && s.eeeDisabled) {
          s.preferredLeader = document.getElementById("d2-leader").value;
          s.extSync = document.getElementById("d2-ext").value;
          if (s.preferredLeader === "DSP-CORE-01" && s.extSync === "OFF") { s.leaderSet = true; s.clockVerified = true; s.mentorTone = "good"; s.mentorText = "PTPv2 Grandmaster locked at 0.02 µs offset! Module 02 cleared!"; recordAction(true, "dante_2"); }
          else { s.mentorTone = "bad"; s.mentorText = "Set Preferred Leader = DSP-CORE-01 and External Word Clock Sync = Disabled!"; recordAction(false); }
        } else { s.mentorTone = "warn"; s.mentorText = "Disable EEE on the switch first, then use PTPv2 Clock Tool."; recordAction(false); }
      }
      render(); return;
    }

    if (target.startsWith("dante3_")) {
      const s = dante3;
      if (target === "dante3_vlan") {
        if (selectedTool === "vlan") { s.vlansIsolated = true; s.mentorTone = "good"; s.mentorText = "Primary (VLAN 10) and Secondary (VLAN 20) isolated! Enable IGMP Snooping & Querier next."; recordAction(true); }
        else { s.mentorTone = "warn"; s.mentorText = "Select VLAN Isolator tool."; recordAction(false); }
      } else if (target === "dante3_igmp") {
        if (selectedTool === "igmp" && s.vlansIsolated) { s.igmpEnabled = true; s.mentorTone = "good"; s.mentorText = "IGMP Snooping & Querier active! Optimize the 64-channel flow with Flow Optimizer."; recordAction(true); }
        else { s.mentorTone = "warn"; s.mentorText = "Isolate Primary/Secondary VLANs first, then enable IGMP Snooping."; recordAction(false); }
      } else if (target === "dante3_flow") {
        if (selectedTool === "flow" && s.igmpEnabled) { s.flowModeFixed = true; s.verifiedZeroDrop = true; s.mentorTone = "good"; s.mentorText = "Multicast pruned and 0 late packets/sec verified! Module 03 cleared!"; recordAction(true, "dante_3"); }
        else { s.mentorTone = "warn"; s.mentorText = "Enable IGMP Snooping first, then use Flow Optimizer."; recordAction(false); }
      }
      render(); return;
    }

    if (target.startsWith("dante4_")) {
      const s = dante4;
      if (target === "dante4_ddm") {
        if (selectedTool === "ddm") { s.ddmEnrolled = true; s.mentorTone = "good"; s.mentorText = "Devices enrolled into BROADCAST_L3 DDM Domain! Enable AES67 Interop next."; recordAction(true); }
        else { s.mentorTone = "warn"; s.mentorText = "Select DDM Domain Tool."; recordAction(false); }
      } else if (target === "dante4_aes67") {
        if (selectedTool === "aes67" && s.ddmEnrolled) { s.aes67Enabled = true; s.mentorTone = "good"; s.mentorText = "AES67 SAP/SDP 239.69.1.10 (48 kHz) active! Apply DiffServ DSCP QoS policy next."; recordAction(true); }
        else { s.mentorTone = "warn"; s.mentorText = "Enroll DDM domain first, then use AES67 Bridge."; recordAction(false); }
      } else if (target === "dante4_qos") {
        if (selectedTool === "qos" && s.aes67Enabled) { s.qosMapped = true; s.verifiedEnterprise = true; s.mentorTone = "good"; s.mentorText = "DSCP 56 (PTP) & DSCP 46 EF (Audio) strict priority active! Audinate Dante Track Certified!"; recordAction(true, "dante_4"); }
        else { s.mentorTone = "warn"; s.mentorText = "Enable AES67 Bridge first, then apply DiffServ QoS Tool."; recordAction(false); }
      }
      render(); return;
    }

    // --- TRACK 04: AVIXA CTS & CTS-D ---
    if (target.startsWith("av1_")) {
      const s = av1;
      if (target === "av1_plate") {
        if (selectedTool === "hand") { s.cableSeated = true; s.mentorTone = "good"; s.mentorText = "Table HDMI pigtail seated! Switch the display input to HDMI 1 with Cable/Input Tool."; recordAction(true); }
        else { s.mentorTone = "warn"; s.mentorText = "Select Cable / Input Tool to seat the HDMI connector."; recordAction(false); }
      } else if (target === "av1_display") {
        if (selectedTool === "hand" && s.cableSeated) { s.inputSwitched = true; s.mentorTone = "good"; s.mentorText = "Switched display to HDMI 1! Verify video sync with Sink Verifier."; recordAction(true); }
        else if (selectedTool === "display" && s.inputSwitched) { s.signalVerified = true; s.mentorTone = "good"; s.mentorText = "1080p60 video lock verified! Module 01 cleared!"; recordAction(true, "av_1"); }
        else { s.mentorTone = "warn"; s.mentorText = "Seat table HDMI → switch display to HDMI 1 → verify with Sink Verifier."; recordAction(false); }
      }
      render(); return;
    }

    if (target.startsWith("av2_")) {
      const s = av2;
      if (target === "av2_cable") {
        if (selectedTool === "certifier") { s.cableTested = true; s.mentorTone = "warn"; s.mentorText = "Certifier failed: Unshielded UTP suffering alien crosstalk (ANEXT)! Install Shielded Cat6A F/UTP."; recordAction(true); }
        else if (selectedTool === "stp" && s.cableTested) { s.cableShielded = true; s.mentorTone = "good"; s.mentorText = "Shielded Cat6A F/UTP installed! Probe Matrix EDID bandwidth next."; recordAction(true); }
        else { s.mentorTone = "warn"; s.mentorText = "Test with Cat6A Certifier first, then install Shielded Cat6A."; recordAction(false); }
      } else if (target === "av2_matrix") {
        if (selectedTool === "edid" && s.cableShielded) { s.edidAnalyzed = true; s.mentorTone = "warn"; s.mentorText = "Source outputs 17.82 Gbps (4:4:4), exceeding HDBaseT's 10.2 Gbps limit! Select 4K60 4:2:0 (10.2 Gbps) and click Set."; recordAction(true); }
        else { s.mentorTone = "warn"; s.mentorText = "Install Shielded Cat6A first, then probe Matrix with EDID/TMDS Probe."; recordAction(false); }
      } else if (target === "av2_display") {
        if (selectedTool === "display" && s.edidFixed) { s.sinkVerified = true; s.mentorTone = "good"; s.mentorText = "4K60 4:2:0 locked cleanly across 45m HDBaseT! Module 02 cleared!"; recordAction(true, "av_2"); }
        else { s.mentorTone = "warn"; s.mentorText = "Constrain EDID to 10.2 Gbps first, then verify with Sink Verifier."; recordAction(false); }
      }
      render(); return;
    }

    if (target.startsWith("av3_")) {
      const s = av3;
      if (target === "av3_scaler") {
        if (selectedTool === "hdcp") { s.hdcpAnalyzed = true; s.mentorTone = "warn"; s.mentorText = "Handshake mismatch: HDCP 2.2 → legacy HDCP 1.4 projector! Select Down-Convert HDCP 1.4 & YCbCr 4:2:2 below, then click Matrix with Scaler Config."; recordAction(true); }
        else if (selectedTool === "scaler" && s.hdcpAnalyzed) {
          s.hdcpMode = document.getElementById("av3-hdcp").value;
          s.colorMode = document.getElementById("av3-color").value;
          if (s.hdcpMode === "CONV_14" && s.colorMode === "YCBCR_422") { s.hdcpDowngraded = true; s.colorSpaceSet = true; s.mentorTone = "good"; s.mentorText = "Scaler configured for HDCP 1.4 & YCbCr 4:2:2 8-bit! Verify projector lock with Projector Lock tool."; recordAction(true); }
          else { s.mentorTone = "bad"; s.mentorText = "Select Down-Convert HDCP 2.2 → 1.4 and YCbCr 4:2:2 8-Bit first!"; recordAction(false); }
        } else { s.mentorTone = "warn"; s.mentorText = "Probe Matrix with HDCP/Color Probe first, then apply Scaler Config."; recordAction(false); }
      } else if (target === "av3_proj") {
        if (selectedTool === "display" && s.hdcpDowngraded && s.colorSpaceSet) { s.sinkVerified = true; s.mentorTone = "good"; s.mentorText = "Protected 4K video locked cleanly on legacy projector! Module 03 cleared!"; recordAction(true, "av_3"); }
        else { s.mentorTone = "warn"; s.mentorText = "Configure HDCP 1.4 & YCbCr 4:2:2 on Scaler first, then click Projector with Projector Lock."; recordAction(false); }
      }
      render(); return;
    }

    if (target.startsWith("av4_")) {
      const s = av4;
      if (target === "av4_spl") {
        if (selectedTool === "spl") {
          s.splAnswer = document.getElementById("av4-spl").value;
          if (s.splAnswer === "76") { s.splCalculated = true; s.mentorTone = "good"; s.mentorText = "Correct! Doubling distance twice (2m → 4m → 8m) attenuates 12 dB (88 - 12 = 76 dB SPL). Verify PAG ≥ NAG next."; recordAction(true); }
          else { s.mentorTone = "bad"; s.mentorText = "Incorrect: 2m to 8m is two distance doublings (-6 dB × 2 = -12 dB → 76 dB SPL)."; recordAction(false); }
        } else { s.mentorTone = "warn"; s.mentorText = "Select SPL & Distance Meter tool."; recordAction(false); }
      } else if (target === "av4_pag") {
        if (selectedTool === "pag" && s.splCalculated) {
          s.pagMargin = document.getElementById("av4-pag").value;
          if (s.pagMargin === "PASS_PAG") { s.pagVerified = true; s.mentorTone = "good"; s.mentorText = "PAG (18 dB) ≥ NAG (14 dB) confirmed with 4 dB feedback stability margin! Verify Lens Throw Ratio next."; recordAction(true); }
          else { s.mentorTone = "bad"; s.mentorText = "PAG must be greater than or equal to NAG to prevent acoustic feedback!"; recordAction(false); }
        } else { s.mentorTone = "warn"; s.mentorText = "Verify Inverse Square SPL first, then use PAG / NAG Analyzer."; recordAction(false); }
      } else if (target === "av4_lens") {
        if (selectedTool === "lens" && s.pagVerified) {
          s.throwRatio = document.getElementById("av4-throw").value;
          if (s.throwRatio === "1.5") { s.throwCalibrated = true; s.designSignedOff = true; s.mentorTone = "good"; s.mentorText = "Throw Ratio 4.5m / 3.0m = 1.5:1 verified! AVIXA CTS & CTS-D Track Certified!"; recordAction(true, "av_4"); }
          else { s.mentorTone = "bad"; s.mentorText = "Throw Ratio = Throw Distance (4.5m) / Image Width (3.0m) = 1.5:1."; recordAction(false); }
        } else { s.mentorTone = "warn"; s.mentorText = "Verify PAG/NAG first, then use Throw Ratio Optics tool."; recordAction(false); }
      }
      render(); return;
    }

    // --- TRACK 05: Q-SYS LEVEL 1 & 2 ---
    if (target.startsWith("qs1_")) {
      const s = qs1;
      if (target === "qs1_gain") {
        if (selectedTool === "meter") {
          if (s.micGain >= 3 && s.micGain <= 9) { s.gainStaged = true; s.mentorTone = "good"; s.mentorText = "Mic In 1 staged at -12 dBFS nominal! Clear the Output Mute block with Mute Override."; recordAction(true); }
          else { s.mentorTone = "bad"; s.mentorText = "Adjust Mic Gain slider into the +3 to +9 dB green zone first!"; recordAction(false); }
        } else { s.mentorTone = "warn"; s.mentorText = "Select Gain / Trim Tool."; recordAction(false); }
      } else if (target === "qs1_mute") {
        if (selectedTool === "logic" && s.gainStaged) { s.logicMuted = false; s.mentorTone = "good"; s.mentorText = "Output Mute cleared! Inspect CX-Q 4K4 Amplifier with Amp Telemetry tool."; recordAction(true); }
        else { s.mentorTone = "warn"; s.mentorText = "Stage Mic Gain first, then use Mute Override."; recordAction(false); }
      } else if (target === "qs1_amp") {
        if (selectedTool === "amp" && !s.logicMuted) { s.ampVerified = true; s.mentorTone = "good"; s.mentorText = "CX-Q 4K4 amplifier output verified! Module 01 cleared!"; recordAction(true, "qs_1"); }
        else { s.mentorTone = "warn"; s.mentorText = "Clear Output Mute first, then verify with Amp Telemetry."; recordAction(false); }
      }
      render(); return;
    }

    if (target.startsWith("qs2_")) {
      const s = qs2;
      if (target === "qs2_voip" || target === "qs2_aec") {
        if (selectedTool === "wire") {
          if (!s.pendingPin) { s.pendingPin = target; s.mentorText = "Pin selected—click the matching pin (VOIP RX OUT ↔ AEC REF PIN)."; }
          else if (s.pendingPin !== target) { s.aecWired = true; s.pendingPin = null; s.mentorTone = "good"; s.mentorText = "AEC Reference wired! Set NLP to Medium below and click AEC Processor with AEC / NLP Tuner."; recordAction(true); }
        } else if (selectedTool === "aec" && target === "qs2_aec" && s.aecWired) {
          s.nlpLevel = document.getElementById("qs2-nlp").value;
          if (s.nlpLevel === "MEDIUM") { s.erlTuned = true; s.duplexVerified = true; s.mentorTone = "good"; s.mentorText = "AEC converged at 28 dB ERL with zero far-end echo! Module 02 cleared!"; recordAction(true, "qs_2"); }
          else { s.mentorTone = "bad"; s.mentorText = "Set NLP Aggression to Medium first!"; recordAction(false); }
        } else { s.mentorTone = "warn"; s.mentorText = "Use Schematic Wire to connect VoIP RX Out to AEC Reference first."; recordAction(false); }
      }
      render(); return;
    }

    if (target.startsWith("qs3_")) {
      const s = qs3;
      if (target === "qs3_dyn") {
        if (selectedTool === "meter") {
          s.limiterActive = document.getElementById("qs3-lim").value === "true";
          if (s.micGain >= 3 && s.micGain <= 9 && s.limiterActive) { s.gainFixed = true; s.limiterEngaged = true; s.mentorTone = "good"; s.mentorText = "Preamp staged (+3..+9 dB) and +4 dBu Peak Limiter engaged! Switch CX-Q Ch 1 to 70V High-Z + 80Hz HPF."; recordAction(true); }
          else { s.mentorTone = "bad"; s.mentorText = "Lower Mic Gain into +3..+9 dB and set Peak Limiter to Engaged first!"; recordAction(false); }
        } else { s.mentorTone = "warn"; s.mentorText = "Select Gain & Limiter tool."; recordAction(false); }
      } else if (target === "qs3_amp") {
        if (selectedTool === "ampcfg" && s.gainFixed && s.limiterEngaged) {
          s.ampMode = document.getElementById("qs3-mode").value;
          if (s.ampMode === "HIGH_Z_70V") { s.ampModeFixed = true; s.mentorTone = "good"; s.mentorText = "CX-Q Ch 1 switched to 70V High-Z + 80Hz HPF! Verify line impedance with Amp Telemetry."; recordAction(true); }
          else { s.mentorTone = "bad"; s.mentorText = "Select 70V High-Z + 80Hz HPF in the dropdown first!"; recordAction(false); }
        } else if (selectedTool === "amp" && s.ampModeFixed) { s.ampVerified = true; s.mentorTone = "good"; s.mentorText = "48 Ω 70V distributed line verified with zero over-current trips! Module 03 cleared!"; recordAction(true, "qs_3"); }
        else { s.mentorTone = "warn"; s.mentorText = "Fix dynamics → apply Amp Output Mode (70V High-Z) → verify with Amp Telemetry."; recordAction(false); }
      }
      render(); return;
    }

    if (target.startsWith("qs4_")) {
      const s = qs4;
      if (target === "qs4_gpio") {
        if (selectedTool === "gpio") {
          s.gpioLogic = document.getElementById("qs4-gpio").value;
          if (s.gpioLogic === "NC_FAILSAFE") { s.gpioWired = true; s.mentorTone = "good"; s.mentorText = "Fail-safe Normally-Closed (NC) Fire Alarm GPIO wired to Emergency Mute! Deploy Auditorium_Main UCI next."; recordAction(true); }
          else { s.mentorTone = "bad"; s.mentorText = "Life-safety fire alarm interfaces must be Normally-Closed (NC Fail-Safe)!"; recordAction(false); }
        } else { s.mentorTone = "warn"; s.mentorText = "Select GPIO Life-Safety Wire tool."; recordAction(false); }
      } else if (target === "qs4_uci") {
        if (selectedTool === "uci" && s.gpioWired) {
          s.uciPage = document.getElementById("qs4-uci").value;
          if (s.uciPage === "AUDITORIUM_MAIN") { s.uciDeployed = true; s.mentorTone = "good"; s.mentorText = "Auditorium_Main.uci deployed to TSC-70 touch panel! Audit Q-LAN PTPv2 clock lock next."; recordAction(true); }
          else { s.mentorTone = "bad"; s.mentorText = "Select Auditorium_Main.uci first!"; recordAction(false); }
        } else { s.mentorTone = "warn"; s.mentorText = "Wire NC Fire-Alarm GPIO first, then use UCI Deployer."; recordAction(false); }
      } else if (target === "qs4_ptp") {
        if (selectedTool === "ptp" && s.uciDeployed) { s.ptpSynced = true; s.mentorTone = "good"; s.mentorText = "Q-LAN PTPv2 Grandmaster sync locked! Q-SYS Level 1 & 2 Track Certified!"; recordAction(true, "qs_4"); }
        else { s.mentorTone = "warn"; s.mentorText = "Deploy UCI first, then click with Q-LAN PTP Verifier."; recordAction(false); }
      }
      render();
    }
  }

  /* ==========================================================================
     16. EVENT LISTENERS, TOOLTIPS & RESET HANDLERS
     ========================================================================== */
  function bindTooltips() {
    const tip = document.getElementById("svg-tip");
    if (!tip) return;
    document.querySelectorAll(".hotspot").forEach(el => {
      el.addEventListener("mouseenter", () => {
        const title = el.getAttribute("data-tip-title");
        const body = el.getAttribute("data-tip-body");
        if (!title) return;
        tip.innerHTML = `<strong>${title}</strong>${body || ""}`;
        tip.style.opacity = "1";
      });
      el.addEventListener("mousemove", e => {
        const rect = el.closest(".svg-viewport").getBoundingClientRect();
        tip.style.left = `${Math.min(rect.width - 265, Math.max(10, e.clientX - rect.left + 14))}px`;
        tip.style.top = `${Math.max(10, e.clientY - rect.top - 12)}px`;
      });
      el.addEventListener("mouseleave", () => { tip.style.opacity = "0"; });
    });
  }

  function resetTier(key) {
    playTone("click");
    delete saveData.tierStats[key];
    saveData.completed = saveData.completed.filter(k => k !== key);
    persist();
    if (key === "pc_1") Object.assign(pc1, { esdAttached: false, psuChecked: false, postRead: false, ramReseated: false, bootVerified: false, mentorTone: "", mentorText: "Module 01 reset. Bond ESD Wrist Strap to bare steel first.", lastReading: "POST LED: 55 (Memory Initialization Failure) | +12V Rail: Standby" });
    if (key === "pc_2") Object.assign(pc2, { esdAttached: false, telemetryRead: false, filterCleaned: false, pasteCleaned: false, pasteApplied: false, coolerMounted: false, mentorTone: "", mentorText: "Module 02 reset. Bond ESD strap and probe Fan/Pump Header.", lastReading: "CPU PKG: 102°C (TJMAX THROTTLE!) | AIO PUMP: 2850 RPM" });
    if (key === "pc_3") Object.assign(pc3, { esdAttached: false, railsProbed: false, railSwapped: false, padFixed: false, nvmeReseated: false, biosVerified: false, mentorTone: "", mentorText: "Module 03 reset. Ground chassis and probe +12V droop.", lastReading: "+12V RAIL A LOAD: 11.18V (FAIL) | M.2 CONTROLLER: 84°C" });
    if (key === "pc_4") Object.assign(pc4, { esdAttached: false, tpmReseated: false, biosConfigured: false, bitlockerUnlocked: false, secureBoot: "DISABLED", tpmState: "OFF", mentorTone: "", mentorText: "Module 04 reset. Ground chassis and reseat dTPM 2.0.", lastReading: "TPM 2.0: NOT DETECTED | SECURE BOOT: OFF | BITLOCKER LOCKED" });
    if (key === "network_1") Object.assign(net1, { dropTraced: false, patchedPort7: false, pendingPatchFrom: null, cliInspected: false, vlanFixed: false, pingVerified: false, selectedVlan: "999", mentorTone: "", mentorText: "Module 01 reset. Tone out Wall Drop D-14 first.", cliLog: "SW-IDF-02> awaiting console connection..." });
    if (key === "network_2") Object.assign(net2, { cliInspected: false, allowedFixed: false, nativeFixed: false, dhcpVerified: false, allowedVal: "10,99", nativeVal: "1", mentorTone: "", mentorText: "Module 02 reset. Inspect SW-01 with RJ45 Console.", cliLog: "SW-01> connect console cable..." });
    if (key === "network_3") Object.assign(net3, { stpInspected: false, bpduGuardEnabled: false, portCleared: false, pingVerified: false, mentorTone: "", mentorText: "Module 03 reset. Inspect Spanning Tree CLI.", cliLog: "SW-IDF-02> SYSLOG: %SPANTREE-2-LOOP_DETECTED..." });
    if (key === "network_4") Object.assign(net4, { ospfInspected: false, ospfFixed: false, aclFixed: false, wanVerified: false, ospfArea: "10", aclRule: "DENY_443", mentorTone: "", mentorText: "Module 04 reset. Inspect R1 Router Console.", cliLog: "R1-BRANCH# awaiting console connection..." });
    if (key === "dante_1") Object.assign(dante1, { sampleRateSynced: false, routedCh1: false, routedCh2: false, txRate: "96", rxRate: "48", mentorTone: "", mentorText: "Module 01 reset. Align both devices to 48 kHz." });
    if (key === "dante_2") Object.assign(dante2, { eeeDisabled: false, leaderSet: false, clockVerified: false, preferredLeader: "NONE", extSync: "ON", mentorTone: "", mentorText: "Module 02 reset. Disable 802.3az EEE first." });
    if (key === "dante_3") Object.assign(dante3, { vlansIsolated: false, igmpEnabled: false, flowModeFixed: false, verifiedZeroDrop: false, mentorTone: "", mentorText: "Module 03 reset. Isolate Primary and Secondary VLANs." });
    if (key === "dante_4") Object.assign(dante4, { ddmEnrolled: false, aes67Enabled: false, qosMapped: false, verifiedEnterprise: false, mentorTone: "", mentorText: "Module 04 reset. Enroll DDM domain first." });
    if (key === "av_1") Object.assign(av1, { cableSeated: false, inputSwitched: false, signalVerified: false, mentorTone: "", mentorText: "Module 01 reset. Seat loose table HDMI pigtail." });
    if (key === "av_2") Object.assign(av2, { cableTested: false, cableShielded: false, edidAnalyzed: false, edidFixed: false, sinkVerified: false, edidMode: "4K60_444", mentorTone: "", mentorText: "Module 02 reset. Certify HDBaseT Cat6A link." });
    if (key === "av_3") Object.assign(av3, { hdcpAnalyzed: false, hdcpDowngraded: false, colorSpaceSet: false, sinkVerified: false, hdcpMode: "PASS_22", colorMode: "RGB_10BIT", mentorTone: "", mentorText: "Module 03 reset. Probe Matrix with HDCP/Color Probe." });
    if (key === "av_4") Object.assign(av4, { splCalculated: false, pagVerified: false, throwCalibrated: false, designSignedOff: false, splAnswer: "82", pagMargin: "FAIL_LOOP", throwRatio: "0.8", mentorTone: "", mentorText: "Module 04 reset. Verify Inverse Square Law SPL first." });
    if (key === "qs_1") Object.assign(qs1, { gainStaged: false, ampVerified: false, micGain: -18, logicMuted: true, mentorTone: "", mentorText: "Module 01 reset. Stage Mic Gain into +3..+9 dB." });
    if (key === "qs_2") Object.assign(qs2, { aecWired: false, pendingPin: null, erlTuned: false, duplexVerified: false, nlpLevel: "OFF", mentorTone: "", mentorText: "Module 02 reset. Wire VoIP RX Out to AEC Reference." });
    if (key === "qs_3") Object.assign(qs3, { gainFixed: false, limiterEngaged: false, ampModeFixed: false, ampVerified: false, micGain: 24, limiterActive: false, ampMode: "LOW_Z_4OHM", mentorTone: "", mentorText: "Module 03 reset. Lower clipping preamp gain." });
    if (key === "qs_4") Object.assign(qs4, { gpioWired: false, pendingGpio: null, uciDeployed: false, ptpSynced: false, gpioLogic: "NO_FAULT", uciPage: "UNASSIGNED", mentorTone: "", mentorText: "Module 04 reset. Wire NC Fire-Alarm GPIO first." });
    render();
  }

  document.addEventListener("click", e => {
    const navBtn = e.target.closest("[data-view], [data-nav]");
    if (navBtn) { setView(navBtn.dataset.view || navBtn.dataset.nav); return; }

    const tierBtn = e.target.closest("[data-set-tier]");
    if (tierBtn) { setTier(currentView, tierBtn.dataset.setTier); return; }

    const toolBtn = e.target.closest("[data-tool]");
    if (toolBtn) { playTone("click"); selectedTool = toolBtn.dataset.tool; render(); return; }

    const resetBtn = e.target.closest("[data-reset-bench]");
    if (resetBtn) { resetTier(resetBtn.dataset.resetBench); return; }

    const hs = e.target.closest("[data-target]");
    if (hs) { handleHotspotClick(hs.dataset.target); return; }

    if (e.target.id === "net1-commit") {
      net1.selectedVlan = document.getElementById("net1-vlan").value;
      if (net1.selectedVlan === "10") {
        net1.vlanFixed = true; net1.mentorTone = "good"; net1.mentorText = "Gi0/7 assigned to VLAN 10! Run Net Tester/Ping on Wall Drop D-14.";
        net1.cliLog = "SW-IDF-02(config-if)# switchport access vlan 10\nSW-IDF-02(config-if)# end"; recordAction(true);
      } else { net1.mentorTone = "bad"; net1.mentorText = "VLAN 999 is Parking—select VLAN 10 — STAFF!"; recordAction(false); }
      render(); return;
    }

    if (e.target.id === "av2-commit") {
      av2.edidMode = document.getElementById("av2-edid").value;
      if (av2.edidMode === "4K60_420") {
        av2.edidFixed = true; av2.mentorTone = "good"; av2.mentorText = "EDID locked to 4K60 4:2:0 (10.2 Gbps)! Verify 4K Display with Sink Verifier."; recordAction(true);
      } else { av2.mentorTone = "bad"; av2.mentorText = "17.82 Gbps exceeds HDBaseT's 10.2 Gbps limit—choose 4K60 4:2:0!"; recordAction(false); }
      render(); return;
    }

    const optBtn = e.target.closest("[data-exam-opt]");
    if (optBtn && !examState.answered) {
      const idx = Number(optBtn.dataset.examOpt);
      examState.answered = true;
      examState.picked = idx;
      if (idx === examQuestions[examState.idx].ans) { examState.score++; playTone("good"); }
      else { playTone("bad"); }
      render(); return;
    }

    if (e.target.id === "exam-next") {
      if (examState.idx + 1 < examQuestions.length) {
        examState.idx++; examState.answered = false; examState.picked = null;
      } else {
        examState.finished = true;
        const pct = Math.round((examState.score / examQuestions.length) * 100);
        if (saveData.examBest === null || pct > saveData.examBest) { saveData.examBest = pct; persist(); }
        if (pct >= 80) playTone("cert");
      }
      render(); return;
    }

    if (e.target.id === "exam-restart") {
      examState = { idx: 0, score: 0, answered: false, picked: null, finished: false };
      render(); return;
    }
  });

  document.addEventListener("input", e => {
    if (e.target.id === "qs1-slider") { qs1.micGain = Number(e.target.value); render(); }
    if (e.target.id === "qs3-slider") { qs3.micGain = Number(e.target.value); render(); }
    if (e.target.id === "gloss-search") { glossaryFilter = e.target.value.toLowerCase(); render(); }
  });

  document.getElementById("btn-audio-toggle").addEventListener("click", e => {
    sfxEnabled = !sfxEnabled;
    e.target.textContent = sfxEnabled ? "🔊 SFX: ON" : "🔇 SFX: OFF";
    if (sfxEnabled) playTone("click");
  });

  document.getElementById("btn-reset-all").addEventListener("click", () => {
    localStorage.removeItem(STORAGE_KEY);
    saveData = { ...defaultSave, completed: [], tierStats: {} };
    ["pc_1","pc_2","pc_3","pc_4","network_1","network_2","network_3","network_4","dante_1","dante_2","dante_3","dante_4","av_1","av_2","av_3","av_4","qs_1","qs_2","qs_3","qs_4"].forEach(resetTier);
    updateHUD();
    showToast("All 20 certification modules & telemetry reset.");
  });

  updateHUD();
  render();
})();
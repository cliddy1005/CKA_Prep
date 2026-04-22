window.NetForgeData = {
  metrics: [
    {
      label: 'Learning modules',
      value: '10',
      sub: 'Structured across multicast, EVPN, and fabric fundamentals.'
    },
    {
      label: 'Troubleshooting scenarios',
      value: '5',
      sub: 'Command-driven investigations with realistic outputs and diagnosis.'
    },
    {
      label: 'Validation questions',
      value: '15',
      sub: 'Domain-level scoring, weak-area visibility, and local progress storage.'
    },
    {
      label: 'Deployment model',
      value: 'Static PWA',
      sub: 'Single repo, multi-file design, offline cache, install-friendly shell.'
    }
  ],
  overviewModules: [
    {
      domain: 'Multicast',
      title: 'Multicast Fundamentals',
      summary: 'Addressing, replication, last-hop membership, and why networks replicate instead of sources.',
      tags: ['224/4', 'Group model', 'L2 mapping']
    },
    {
      domain: 'Multicast',
      title: 'IGMP and PIM-SM',
      summary: 'Receiver state, snooping, RPF checks, shared trees, and source-tree switchover.',
      tags: ['IGMPv3', 'RPF', 'RP']
    },
    {
      domain: 'EVPN',
      title: 'EVPN Route Types',
      summary: 'Type 1 through Type 5 routes and the control-plane meaning behind each.',
      tags: ['Type 2', 'Type 3', 'Type 5']
    },
    {
      domain: 'EVPN',
      title: 'Symmetric IRB & Multi-Homing',
      summary: 'L3 VNIs, ESIs, aliasing, and standards-based active-active design.',
      tags: ['L3 VNI', 'ESI', 'DF']
    },
    {
      domain: 'Fabric',
      title: 'Clos Fabrics and Underlay',
      summary: 'Spine-leaf behavior, ECMP, underlay simplicity, and VXLAN entropy.',
      tags: ['Clos', 'eBGP', 'Entropy']
    },
    {
      domain: 'Ops',
      title: 'CLI Troubleshooting Flow',
      summary: 'Use outputs to determine fault domain, then prove the next step with the right command.',
      tags: ['Diagnosis', 'Outputs', 'Instincts']
    }
  ],
  learnTopics: [
    {
      icon: '📡',
      title: 'Multicast Fundamentals',
      sub: 'Address ranges, group model, and network-side replication',
      keywords: ['multicast', 'group', 'address', 'ssm'],
      content: `
        <h5>Why multicast exists</h5>
        <p>Unicast creates one source copy per receiver. Multicast allows the source to send once while the network replicates at branch points only where receivers exist.</p>
        <div class="callout good"><strong>Core idea:</strong> multicast scales because the source is not responsible for fan-out. Routers replicate where the tree branches.</div>
        <h5>Addressing</h5>
        <p>IPv4 multicast uses <code>224.0.0.0/4</code>. Practical ranges include <code>224.0.0.0/24</code> for link-local control, <code>232.0.0.0/8</code> for SSM, and <code>239.0.0.0/8</code> for administratively scoped use.</p>
        <table class="compare-table">
          <tr><th>Range</th><th>Purpose</th></tr>
          <tr><td><code>224.0.0.0/24</code></td><td>Link-local. Never routed. Used by local control protocols.</td></tr>
          <tr><td><code>232.0.0.0/8</code></td><td>Source-Specific Multicast range.</td></tr>
          <tr><td><code>239.0.0.0/8</code></td><td>Private multicast scope inside an organization.</td></tr>
        </table>
        <h5>Layer 2 mapping</h5>
        <p>IPv4 multicast groups map into the <code>01:00:5E</code> MAC range using the low 23 bits, which means different groups can collide at Layer 2.</p>
        <div class="callout warn"><strong>Operational note:</strong> switches use IGMP snooping to constrain forwarding by receiver state. Pure L2 MAC mapping is ambiguous.</div>
      `
    },
    {
      icon: '🔌',
      title: 'IGMP and Receiver State',
      sub: 'How hosts express interest and how snooping reduces flooding',
      keywords: ['igmp', 'querier', 'snooping', 'receiver'],
      content: `
        <h5>What IGMP does</h5>
        <p>IGMP runs between hosts and their local router. It tells the last-hop device which groups have interested receivers on a subnet.</p>
        <table class="compare-table">
          <tr><th>Version</th><th>Capability</th></tr>
          <tr><td><strong>IGMPv1</strong></td><td>Basic membership reporting</td></tr>
          <tr><td><strong>IGMPv2</strong></td><td>Explicit leave and group-specific query support</td></tr>
          <tr><td><strong>IGMPv3</strong></td><td>Source filtering for SSM via include/exclude lists</td></tr>
        </table>
        <div class="callout"><strong>Best practice:</strong> prefer IGMPv3 where possible. It supports source-aware joins and aligns with SSM deployments.</div>
        <div class="cmd-block"><span class="prompt">Leaf-12#</span> show ip igmp snooping groups
Vlan20   239.1.1.1   ports: Eth1/5, Eth1/7
Vlan20   239.1.1.9   ports: Eth1/11</div>
        <div class="callout warn"><strong>Critical dependency:</strong> snooping needs a querier. Without queries, forwarding can degrade to flooding or stale state.</div>
      `
    },
    {
      icon: '🌲',
      title: 'PIM-SM, RP, and RPF',
      sub: 'Tree construction across routers',
      keywords: ['pim', 'rpf', 'rp', 'tree'],
      content: `
        <h5>Why PIM matters</h5>
        <p>IGMP handles host-to-router membership. PIM handles router-to-router multicast forwarding using the existing unicast routing table to determine the reverse path.</p>
        <div class="callout good"><strong>RPF is the key test:</strong> a router only accepts multicast traffic on the interface it would use to reach the source according to unicast routing.</div>
        <h5>PIM-SM operation</h5>
        <p>Receivers first join a shared tree <code>(*,G)</code> rooted at the RP. Once data arrives, routers can switch to a source tree <code>(S,G)</code> for shortest-path forwarding.</p>
        <div class="cmd-block"><span class="prompt">R1#</span> show ip rpf 10.10.10.1
RPF interface: Ethernet1/49
RPF neighbor: 10.0.0.9</div>
        <div class="callout warn"><strong>Failure mode:</strong> if packets arrive on a non-RPF interface, they are dropped even when receiver state exists.</div>
      `
    },
    {
      icon: '⚡',
      title: 'Multicast in VXLAN Fabrics',
      sub: 'BUM handling, underlay multicast, and ingress replication',
      keywords: ['vxlan', 'bum', 'ingress replication', 'underlay'],
      content: `
        <h5>BUM distribution options</h5>
        <p>VXLAN originally used multicast groups in the underlay for BUM traffic. Modern EVPN deployments often use ingress replication to keep the underlay unicast-only.</p>
        <table class="compare-table">
          <tr><th>Method</th><th>Pros</th><th>Tradeoff</th></tr>
          <tr><td>Underlay multicast</td><td>One source copy, efficient replication</td><td>PIM and RP complexity in the underlay</td></tr>
          <tr><td>Ingress replication</td><td>Simpler underlay, no multicast routing needed</td><td>Source VTEP sends N copies</td></tr>
        </table>
        <div class="callout"><strong>Modern reality:</strong> many production fabrics prefer ingress replication because operational simplicity usually beats theoretical efficiency at moderate scale.</div>
      `
    },
    {
      icon: '🧬',
      title: 'EVPN Fundamentals',
      sub: 'Control-plane MAC learning with BGP',
      keywords: ['evpn', 'bgp', 'control plane', 'type 2'],
      content: `
        <h5>Control-plane shift</h5>
        <p>Traditional Layer 2 learns MAC addresses from observed frames. EVPN distributes MAC and IP reachability through BGP so remote VTEPs know where endpoints live before unknown traffic must flood.</p>
        <div class="callout good"><strong>Key idea:</strong> EVPN replaces much of flood-and-learn with control-plane learning.</div>
        <div class="cmd-block"><span class="prompt">Leaf-1#</span> show bgp l2vpn evpn summary
Neighbor        State/PfxRcd
10.0.0.11       Estab  128
10.0.0.12       Estab  133</div>
        <h5>Benefits</h5>
        <p>EVPN enables ARP suppression, host mobility handling, standards-based multi-homing, and cleaner L2/L3 service integration than stretched VLAN designs.</p>
      `
    },
    {
      icon: '📋',
      title: 'EVPN Route Types',
      sub: 'Type 1 through Type 5 and what they really do',
      keywords: ['type 1', 'type 2', 'type 3', 'type 5'],
      content: `
        <table class="compare-table">
          <tr><th>Type</th><th>Name</th><th>Use</th></tr>
          <tr><td><strong>1</strong></td><td>Ethernet Auto-Discovery</td><td>ES membership, aliasing, mass withdrawal</td></tr>
          <tr><td><strong>2</strong></td><td>MAC/IP Advertisement</td><td>Host reachability and ARP suppression</td></tr>
          <tr><td><strong>3</strong></td><td>Inclusive Multicast Ethernet Tag</td><td>VTEP participation in a VNI for BUM handling</td></tr>
          <tr><td><strong>4</strong></td><td>Ethernet Segment</td><td>DF election for multi-homing</td></tr>
          <tr><td><strong>5</strong></td><td>IP Prefix</td><td>Inter-subnet routing advertisement</td></tr>
        </table>
        <div class="callout"><strong>Most important route:</strong> Type 2 is the workhorse. It tells remote VTEPs which VTEP owns a MAC and often which IP is bound to it.</div>
      `
    },
    {
      icon: '🔗',
      title: 'Multi-Homing and ESI',
      sub: 'Standards-based active-active redundancy',
      keywords: ['esi', 'df', 'aliasing', 'split horizon'],
      content: `
        <h5>Ethernet segments</h5>
        <p>An Ethernet Segment is a multi-homed attachment shared by two or more VTEPs. The segment is identified by a 10-byte ESI.</p>
        <h5>DF election</h5>
        <p>For BUM traffic, one leaf is elected the Designated Forwarder on a segment/VLAN context so duplicate forwarding does not occur.</p>
        <div class="callout good"><strong>Aliasing:</strong> remote VTEPs can load-balance toward multiple leafs serving the same ESI, even if only one leaf originally advertised the host MAC.</div>
        <div class="cmd-block"><span class="prompt">Leaf-3#</span> show bgp l2vpn evpn route-type 4
ESI: 0000:0000:0000:1111:2222
DF state: elected
EVI: 1010</div>
      `
    },
    {
      icon: '🌐',
      title: 'Symmetric IRB',
      sub: 'Why L3 VNIs scale better than asymmetric routing',
      keywords: ['irb', 'symmetric', 'l3 vni', 'vrf'],
      content: `
        <h5>Asymmetric vs symmetric</h5>
        <p>Asymmetric IRB routes at ingress only, so the ingress leaf must know both source and destination VLAN contexts. Symmetric IRB uses an L3 VNI so both ingress and egress leafs participate in routing.</p>
        <table class="compare-table">
          <tr><th>Design</th><th>On-wire VNI</th><th>Scale</th></tr>
          <tr><td>Asymmetric IRB</td><td>Destination L2 VNI</td><td>Poor</td></tr>
          <tr><td>Symmetric IRB</td><td>L3 VNI</td><td>Excellent</td></tr>
        </table>
        <div class="callout warn"><strong>Operational takeaway:</strong> production fabrics overwhelmingly prefer symmetric IRB because each leaf only needs local VLANs plus the tenant VRF and L3 VNI.</div>
      `
    },
    {
      icon: '🏗️',
      title: 'Spine-Leaf Architecture',
      sub: 'Clos design and deterministic east-west paths',
      keywords: ['clos', 'spine', 'leaf', 'ecmp'],
      content: `
        <h5>Clos design rules</h5>
        <p>Every leaf connects to every spine. There are no leaf-to-leaf or spine-to-spine links within the pod. Any leaf-to-leaf path is predictable and ECMP-capable.</p>
        <div class="callout good"><strong>Design benefit:</strong> adding spines increases available fabric bandwidth. Adding leafs increases endpoint scale.</div>
        <div class="cmd-block">Leaf A → Spine X → Leaf B
Leaf A → Spine Y → Leaf B
Leaf A → Spine Z → Leaf B</div>
      `
    },
    {
      icon: '🔀',
      title: 'Overlay, Underlay, and Entropy',
      sub: 'Separate physical reachability from tenant forwarding',
      keywords: ['overlay', 'underlay', 'entropy', 'vxlan'],
      content: `
        <h5>Underlay</h5>
        <p>The underlay is simple routed IP. Its job is to provide reachability between VTEP loopbacks with ECMP across the fabric.</p>
        <h5>Overlay</h5>
        <p>The overlay carries tenant traffic inside VXLAN. The underlay only sees outer IP/UDP encapsulation.</p>
        <div class="callout"><strong>VXLAN hashing:</strong> the source VTEP varies the outer UDP source port so the underlay can hash flows across equal-cost paths.</div>
        <div class="cmd-block"><span class="prompt">Leaf-7#</span> show nve peers
Peer-IP        State   LearnType
10.0.0.21      Up      CP
10.0.0.22      Up      CP</div>
      `
    }
  ],
  scenarios: [
    {
      id: 'sc1',
      domain: 'Multicast',
      severity: 'Receiver issue',
      title: 'Market data feed not reaching VLAN 20',
      summary: 'Receivers in VLAN 20 are not getting 239.1.1.1 from source 10.10.10.1 inside an EVPN fabric.',
      context: 'Users on VLAN 20 report no multicast market data. The source is confirmed transmitting. Determine whether the fault is host membership, multicast routing, or overlay transport.',
      meta: ['Source 10.10.10.1', 'Group 239.1.1.1', 'Receiver VLAN 20'],
      commands: [
        {
          label: 'show ip igmp groups',
          output: `Leaf-2# show ip igmp groups\nIGMP Connected Group Membership\nNo entries found.`
        },
        {
          label: 'show ip pim neighbor',
          output: `Leaf-2# show ip pim neighbor\nPIM Neighbor Table\nNeighbor Address    Interface    Uptime\n10.0.0.1            Eth1/49      00:18:33`
        },
        {
          label: 'show ip mroute 239.1.1.1',
          output: `Leaf-2# show ip mroute 239.1.1.1\n% No matching multicast route entries found`
        },
        {
          label: 'show ip rpf 10.10.10.1',
          output: `Leaf-2# show ip rpf 10.10.10.1\nRPF information for 10.10.10.1\n  RPF interface: Eth1/49\n  RPF neighbor: 10.0.0.1\n  RPF route/mask: 10.10.10.0/24`
        }
      ],
      rootCauseOptions: [
        'RPF is failing toward the multicast source',
        'No IGMP join exists from the receiver segment',
        'The RP is unreachable from all leaf switches',
        'The destination VNI is misconfigured'
      ],
      rootCauseAnswer: 1,
      rootCauseExplanation: 'There is no IGMP group membership on the receiver-facing segment, so the leaf never creates multicast state for the group. PIM and RPF are present, but there is no interested receiver to drive forwarding.',
      nextStepOptions: [
        'show bgp l2vpn evpn route-type 2',
        'show ip igmp snooping groups vlan 20',
        'show nve peers',
        'show interface counters errors'
      ],
      nextStepAnswer: 1,
      nextStepExplanation: 'The best next proof point is the IGMP snooping state on VLAN 20. That helps determine whether the host never joined, the switch never learned it, or the querier/snooping flow is broken.'
    },
    {
      id: 'sc2',
      domain: 'Multicast',
      severity: 'Routing fault',
      title: 'PIM joins exist but traffic is still dropped',
      summary: 'A receiver joined correctly, but the last-hop router is dropping multicast because traffic arrives on the wrong interface.',
      context: 'The receiver is subscribed and the RP is reachable. However, the stream still does not arrive. Determine why multicast packets are being rejected.',
      meta: ['PIM-SM', 'RPF validation', 'Source tree'],
      commands: [
        {
          label: 'show ip igmp groups',
          output: `Leaf-5# show ip igmp groups\nVlan30\n  Group: 239.8.8.8\n  Uptime: 00:07:42\n  Last Reporter: 10.30.30.50`
        },
        {
          label: 'show ip mroute 239.8.8.8',
          output: `Leaf-5# show ip mroute 239.8.8.8\n(*,239.8.8.8), uptime: 00:07:11, RP 10.255.255.1\n  Incoming interface: Eth1/50, RPF nbr 10.0.0.5\n  Outgoing interface list:\n    Vlan30, Forward/Sparse\n\n(10.40.40.9,239.8.8.8), uptime: 00:00:54\n  Incoming interface: Eth1/50, RPF nbr 10.0.0.5\n  Outgoing interface list:\n    Null`
        },
        {
          label: 'show ip mroute count',
          output: `Leaf-5# show ip mroute count\n(10.40.40.9,239.8.8.8)\n  packets received on wrong iif: 3482\n  packets forwarded: 0`
        },
        {
          label: 'show ip rpf 10.40.40.9',
          output: `Leaf-5# show ip rpf 10.40.40.9\nRPF interface: Eth1/50\nRPF neighbor: 10.0.0.5`
        }
      ],
      rootCauseOptions: [
        'No receiver membership exists on Vlan30',
        'Multicast packets are arriving on a non-RPF interface',
        'The EVPN type 3 route is missing',
        'IGMPv3 is disabled on all receivers'
      ],
      rootCauseAnswer: 1,
      rootCauseExplanation: 'The router has receiver state, but the multicast route counters show packets received on the wrong incoming interface. That means the RPF check is failing and traffic is dropped.',
      nextStepOptions: [
        'show ip route 10.40.40.9',
        'show bgp l2vpn evpn route-type 5',
        'show mac address-table multicast',
        'show ip igmp interface vlan 30'
      ],
      nextStepAnswer: 0,
      nextStepExplanation: 'The best next command is the unicast route toward the source. RPF depends on the unicast path, so you must verify why the network expects the source on Eth1/50 while packets arrive elsewhere.'
    },
    {
      id: 'sc3',
      domain: 'EVPN',
      severity: 'Control-plane fault',
      title: 'Remote MAC never learns across the fabric',
      summary: 'A host behind Leaf-8 cannot be reached from Leaf-2. ARP broadcasts are visible but remote MAC/IP state never installs.',
      context: 'A tenant host on VNI 101010 is reachable locally but not remotely. The underlay is healthy and NVE peers are up. Determine whether the issue is Type 2 advertisement, replication, or routing.',
      meta: ['EVPN Type 2', 'MAC/IP reachability', 'ARP suppression'],
      commands: [
        {
          label: 'show nve peers',
          output: `Leaf-2# show nve peers\nPeer-IP        State   LearnType\n10.0.0.18      Up      CP\n10.0.0.19      Up      CP`
        },
        {
          label: 'show bgp l2vpn evpn route-type 2',
          output: `Leaf-2# show bgp l2vpn evpn route-type 2\nRoute Distinguisher: 10.0.0.2:101010\n*> [2]:[0]:[0]:[48]:[00:50:56:aa:00:01]:[32]:[10.1.10.11]\n    next-hop 10.0.0.12\n\nNo route for MAC 00:50:56:aa:00:88 in VNI 101010`
        },
        {
          label: 'show bgp l2vpn evpn route-type 3',
          output: `Leaf-2# show bgp l2vpn evpn route-type 3\nIMET route present for VNI 101010 from peers 10.0.0.18 and 10.0.0.19`
        },
        {
          label: 'show evpn mac vni 101010',
          output: `Leaf-2# show evpn mac vni 101010\nMAC Address         Type    Next Hop\n00:50:56:aa:00:01   Remote  10.0.0.12\nNo entry for 00:50:56:aa:00:88`
        }
      ],
      rootCauseOptions: [
        'Type 3 routes are missing, so BUM replication is impossible',
        'The remote VTEP never advertised the host MAC/IP in a Type 2 route',
        'The underlay has no ECMP path to the remote loopback',
        'The L3 VNI is mismatched between tenants'
      ],
      rootCauseAnswer: 1,
      rootCauseExplanation: 'Type 3 routes are present and NVE peers are up, so overlay adjacency exists. The missing element is the remote host Type 2 route, which means the MAC/IP binding was never advertised or was withdrawn.',
      nextStepOptions: [
        'show bgp l2vpn evpn route-type 2 on the remote leaf',
        'show ip pim rp mapping',
        'show spanning-tree vlan 10',
        'show ip route vrf Tenant-A'
      ],
      nextStepAnswer: 0,
      nextStepExplanation: 'The next proving step is to check Type 2 advertisement on the leaf where the host is attached. You need to know whether the local leaf learned the MAC at all and whether it is exporting the route.'
    },
    {
      id: 'sc4',
      domain: 'EVPN',
      severity: 'Routing design fault',
      title: 'Inter-subnet traffic breaks on one leaf',
      summary: 'Hosts in the same tenant but different subnets can communicate from some leafs but not from one newly added leaf.',
      context: 'A new leaf was added for a tenant. Local endpoints work, and L2 reachability is fine, but inter-subnet traffic from that leaf fails. Existing leafs continue to route correctly.',
      meta: ['Symmetric IRB', 'L3 VNI', 'VRF consistency'],
      commands: [
        {
          label: 'show vrf',
          output: `Leaf-11# show vrf\nVRF Tenant-A\n  VNI: not configured\n  Interfaces: Vlan110, Vlan120`
        },
        {
          label: 'show bgp l2vpn evpn route-type 5',
          output: `Leaf-11# show bgp l2vpn evpn route-type 5\nNo EVPN IP Prefix routes imported for VRF Tenant-A`
        },
        {
          label: 'show nve vni',
          output: `Leaf-11# show nve vni\nVNI 10110  L2 [Vlan110]\nVNI 10120  L2 [Vlan120]\nNo L3 VNI configured`
        },
        {
          label: 'show ip route vrf Tenant-A',
          output: `Leaf-11# show ip route vrf Tenant-A\nC    10.110.0.0/24 is directly connected, Vlan110\nC    10.120.0.0/24 is directly connected, Vlan120`
        }
      ],
      rootCauseOptions: [
        'The tenant is missing the L3 VNI / VRF transit configuration on the new leaf',
        'The new leaf is not receiving Type 3 routes for BUM replication',
        'The RPF path to the RP is missing',
        'The UDP source-port entropy range is exhausted'
      ],
      rootCauseAnswer: 0,
      rootCauseExplanation: 'The new leaf has only L2 VNIs and directly connected subnet routes. There is no L3 VNI for the tenant VRF, so symmetric IRB cannot carry inter-subnet traffic across the fabric.',
      nextStepOptions: [
        'Configure the tenant VRF L3 VNI and advertise the IRB prefixes',
        'Enable PIM sparse mode on all access interfaces',
        'Change the underlay from eBGP to OSPF',
        'Disable ARP suppression for the tenant'
      ],
      nextStepAnswer: 0,
      nextStepExplanation: 'The corrective next step is to add the tenant VRF and L3 VNI configuration, then ensure the routing advertisements for that tenant are present.'
    },
    {
      id: 'sc5',
      domain: 'Fabric',
      severity: 'Load-balancing fault',
      title: 'Uneven VXLAN flow distribution across spines',
      summary: 'Large east-west transfers are not balancing well across the fabric. One spine is hot while others are mostly idle.',
      context: 'Operators notice persistent imbalance across equal-cost underlay paths. The fabric is healthy, but a handful of elephant flows dominate traffic on one spine.',
      meta: ['ECMP', 'Entropy', 'Underlay hashing'],
      commands: [
        {
          label: 'show forwarding distribution vxlan',
          output: `Leaf-4# show forwarding distribution vxlan\nPath utilization:\n  Spine-1: 73%\n  Spine-2: 12%\n  Spine-3: 15%`
        },
        {
          label: 'show nve interface detail',
          output: `Leaf-4# show nve interface detail\nSource-interface: loopback1\nUDP dst port: 4789\nUDP src port entropy: disabled`
        },
        {
          label: 'show ip route 10.0.0.0/24',
          output: `Leaf-4# show ip route 10.0.0.0/24\nB    10.0.0.0/24 [20/0] via 172.16.0.1, Eth1/49\n                      via 172.16.0.3, Eth1/50\n                      via 172.16.0.5, Eth1/51`
        },
        {
          label: 'show nve peers',
          output: `Leaf-4# show nve peers\nPeer-IP        State   LearnType\n10.0.0.21      Up      CP\n10.0.0.22      Up      CP`
        }
      ],
      rootCauseOptions: [
        'The underlay has lost ECMP routes to remote VTEPs',
        'VXLAN entropy is disabled so underlay hashing lacks flow diversity',
        'Type 5 routes are missing from the tenant VRF',
        'The spine switches are electing a designated forwarder incorrectly'
      ],
      rootCauseAnswer: 1,
      rootCauseExplanation: 'ECMP paths exist in the underlay, but the VTEP is not varying the outer UDP source port. Without entropy, many VXLAN packets hash identically and land on the same spine.',
      nextStepOptions: [
        'Enable UDP source-port entropy or flow-based hashing on the VTEP',
        'Add another RP for multicast redundancy',
        'Disable ECMP to force a single deterministic path',
        'Convert all VNIs to multicast underlay transport'
      ],
      nextStepAnswer: 0,
      nextStepExplanation: 'The best remediation is to enable VXLAN entropy so the outer packet exposes per-flow variability to the underlay hashing algorithm.'
    }
  ],
  quiz: [
    {
      domain: 'Multicast',
      q: 'What is the primary purpose of RPF in multicast forwarding?',
      opts: ['Encrypt multicast packets between routers', 'Verify the packet arrived on the interface used to reach the source', 'Select the lowest-latency receiver', 'Map multicast groups to VLANs'],
      ans: 1,
      explain: 'RPF validates that multicast traffic arrived on the interface the router would use to reach the source via unicast routing. If it did not, the packet is dropped to prevent loops.'
    },
    {
      domain: 'Multicast',
      q: 'Which IGMP version enables source filtering required for SSM?',
      opts: ['IGMPv1', 'IGMPv2', 'IGMPv3', 'MLD'],
      ans: 2,
      explain: 'IGMPv3 supports include/exclude source lists, which enables Source-Specific Multicast behavior.'
    },
    {
      domain: 'Multicast',
      q: 'In PIM-SM, what is the RP used for?',
      opts: ['To encrypt BUM traffic in VXLAN', 'To act as the shared-tree rendezvous point for sources and receivers', 'To elect the Designated Forwarder in EVPN', 'To map VNIs to multicast MACs'],
      ans: 1,
      explain: 'The Rendezvous Point is the meeting place for PIM-SM shared-tree operation. Sources register there and receivers join via (*,G).'
    },
    {
      domain: 'Multicast',
      q: 'If there are no IGMP joins on the receiver segment, what is the likely outcome?',
      opts: ['The router still builds multicast forwarding state automatically', 'The leaf creates (S,G) entries from ARP traffic', 'There is no receiver-driven multicast forwarding state for the group', 'The RP creates a synthetic join on behalf of the host'],
      ans: 2,
      explain: 'Without receiver interest, the last-hop device does not have reason to join or forward the group toward that segment.'
    },
    {
      domain: 'EVPN',
      q: 'Which EVPN route type carries MAC address and optional IP binding information?',
      opts: ['Type 1', 'Type 2', 'Type 3', 'Type 5'],
      ans: 1,
      explain: 'Type 2 is the MAC/IP Advertisement route and is the core route for host reachability in EVPN.'
    },
    {
      domain: 'EVPN',
      q: 'What is the main purpose of EVPN Type 3 routes?',
      opts: ['Advertise inter-subnet IP prefixes', 'Identify Ethernet Segment multi-homing state', 'Signal VTEP participation in a VNI for BUM replication', 'Carry IGMP reports across the overlay'],
      ans: 2,
      explain: 'Type 3 IMET routes help build ingress replication or multicast distribution membership for a VNI.'
    },
    {
      domain: 'EVPN',
      q: 'What does aliasing provide in EVPN multi-homing?',
      opts: ['It renames VNIs across fabrics', 'It lets remote VTEPs load-balance toward all leafs serving the same ESI', 'It suppresses ARP for all tenants', 'It forces single-active forwarding'],
      ans: 1,
      explain: 'Aliasing lets a remote VTEP use multiple next hops toward a multi-homed segment even if only one leaf advertised the host MAC.'
    },
    {
      domain: 'EVPN',
      q: 'Why is symmetric IRB preferred over asymmetric IRB in production fabrics?',
      opts: ['It removes the need for VRFs', 'It uses the same VNI for every tenant', 'It scales because each leaf only needs local VLANs plus the L3 VNI', 'It eliminates the BGP EVPN control plane'],
      ans: 2,
      explain: 'Symmetric IRB uses an L3 VNI so inter-subnet traffic can traverse the fabric cleanly without requiring every VLAN on every leaf.'
    },
    {
      domain: 'EVPN',
      q: 'What does an ESI identify?',
      opts: ['A multicast source and group pair', 'A loopback used by the VTEP', 'A multi-homed Ethernet Segment shared by two or more leafs', 'A route distinguisher for a tenant VRF'],
      ans: 2,
      explain: 'The Ethernet Segment Identifier identifies the shared segment attached to multiple leafs for active-active multi-homing.'
    },
    {
      domain: 'Fabric',
      q: 'What is the primary goal of the underlay in an EVPN-VXLAN fabric?',
      opts: ['Provide tenant segmentation using VNIs', 'Offer simple IP reachability between VTEP loopbacks with ECMP', 'Handle ARP suppression locally', 'Perform host mobility detection'],
      ans: 1,
      explain: 'The underlay should stay simple and only provide robust IP transport between VTEPs.'
    },
    {
      domain: 'Fabric',
      q: 'Why is eBGP often chosen for large-scale Clos underlays?',
      opts: ['Because it requires multicast to function', 'Because it eliminates the need for loopbacks', 'Because it avoids IGP flooding behavior and scales cleanly', 'Because it automatically maps VLANs to VNIs'],
      ans: 2,
      explain: 'eBGP underlays are popular because they scale well, keep failure domains simple, and avoid IGP flooding overhead.'
    },
    {
      domain: 'Fabric',
      q: 'What role does the VXLAN UDP source port play?',
      opts: ['Tenant authentication', 'ECMP entropy for the underlay', 'Signaling DF election', 'ARP suppression'],
      ans: 1,
      explain: 'The outer UDP source port can vary per inner flow, giving the underlay more entropy for hash-based load balancing.'
    },
    {
      domain: 'Fabric',
      q: 'In a spine-leaf architecture, what typically happens when you add another spine?',
      opts: ['Existing links are blocked by STP', 'The number of equal-cost paths and available bandwidth increases', 'The overlay must be converted to MPLS', 'The leafs no longer need ECMP'],
      ans: 1,
      explain: 'Adding a spine adds another equal-cost path between leaf pairs and increases available fabric bandwidth.'
    },
    {
      domain: 'Fabric',
      q: 'What is the practical difference between L2 VNI and L3 VNI?',
      opts: ['L2 VNI is for multicast only, L3 VNI is for unicast only', 'L2 VNI maps to bridged subnet segments, L3 VNI maps to VRF transit routing', 'L2 VNI uses TCP and L3 VNI uses UDP', 'There is no practical difference'],
      ans: 1,
      explain: 'L2 VNIs extend broadcast domains. L3 VNIs carry routed tenant traffic for a VRF in symmetric IRB designs.'
    },
    {
      domain: 'Multicast',
      q: 'If packets are counted as “received on wrong iif” in multicast state, what does that indicate?',
      opts: ['The IGMP querier is missing', 'The packet is failing the RPF incoming-interface check', 'The EVPN Type 2 route was withdrawn', 'The RP is acting as a DF'],
      ans: 1,
      explain: 'Wrong incoming-interface counters point to RPF failure: multicast is arriving on an interface that is not the expected reverse path toward the source.'
    }
  ],
  reference: [
    {
      title: 'Multicast addressing',
      items: [
        { term: '224.0.0.0/24', def: 'Link-local multicast. Control protocols only. Not routed.' },
        { term: '232.0.0.0/8', def: 'Source-Specific Multicast range. Usually paired with IGMPv3.' },
        { term: '239.0.0.0/8', def: 'Administratively scoped multicast for internal organizational use.' },
        { term: '01:00:5E', def: 'IPv4 multicast MAC prefix. Only the low 23 bits are used.' }
      ]
    },
    {
      title: 'EVPN route types',
      items: [
        { term: 'Type 1', def: 'Ethernet Auto-Discovery for ES membership, aliasing, and mass withdrawal.' },
        { term: 'Type 2', def: 'MAC/IP Advertisement route used for host reachability and ARP suppression.' },
        { term: 'Type 3', def: 'Inclusive Multicast Ethernet Tag route for BUM distribution membership.' },
        { term: 'Type 4', def: 'Ethernet Segment route used in DF election.' },
        { term: 'Type 5', def: 'IP Prefix route for inter-subnet EVPN routing.' }
      ]
    },
    {
      title: 'VXLAN numbers',
      items: [
        { term: 'UDP 4789', def: 'Standard VXLAN destination port.' },
        { term: '24-bit VNI', def: 'Roughly 16 million possible VXLAN network identifiers.' },
        { term: '~50 bytes', def: 'Typical VXLAN encapsulation overhead in the data plane.' },
        { term: '9216 MTU', def: 'Common jumbo MTU recommendation for the underlay.' }
      ]
    },
    {
      title: 'Design reminders',
      items: [
        { term: 'Symmetric IRB', def: 'Preferred for scale. Uses an L3 VNI per tenant VRF.' },
        { term: 'RPF', def: 'Multicast traffic must arrive on the interface used to reach the source.' },
        { term: 'Ingress replication', def: 'Simple underlay, but source VTEP sends a copy per remote VTEP.' },
        { term: 'eBGP underlay', def: 'Popular for Clos fabrics because of scale and bounded failure domains.' }
      ]
    }
  ],
  themeOptions: [
    { name: 'Blue', accent: '#47c0ff', rgb: '71, 192, 255' },
    { name: 'Amber', accent: '#f2b94b', rgb: '242, 185, 75' },
    { name: 'Violet', accent: '#9a7dff', rgb: '154, 125, 255' },
    { name: 'Emerald', accent: '#3fd6a6', rgb: '63, 214, 166' }
  ]
};

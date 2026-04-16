#!/usr/bin/env python3
"""Import real MN Chemical data into the CRM via API."""
import json, requests, sys

API = "http://localhost:8080/api"

def post(path, data):
    r = requests.post(f"{API}{path}", json=data)
    if r.status_code in (200, 201):
        return r.json()
    print(f"  ERROR {r.status_code}: {path} - {r.text[:200]}")
    return None

def get(path):
    return requests.get(f"{API}{path}").json()

# ── Customers ──
print("=== Importing Customers ===")
customers_data = [
    {"name":"Kartali","country":"Turkey","city":"Gebze"},
    {"name":"De Hios","country":"Russia","city":"Lakinsk"},
    {"name":"MN Chemical Russia","country":"Russia","city":"Moscow"},
    {"name":"Norkemi Quim","country":"Spain","city":"Valencia"},
    {"name":"Norkem B.V.","country":"Netherlands","city":"Rotterdam"},
    {"name":"Eriel","country":"Israel","city":"Haifa"},
    {"name":"Beirut Trading","country":"Lebanon","city":"Beirut"},
    {"name":"Konya Chemicals","country":"Turkey","city":"Konya"},
    {"name":"Milenis","country":"Greece","city":"Milenis"},
    {"name":"Genoa Trading","country":"Italy","city":"Genoa"},
    {"name":"Limassol Trading","country":"Cyprus","city":"Limassol"},
    {"name":"Pilshno Trading","country":"Russia","city":"Pilshno"},
    {"name":"Efremov Trading","country":"Russia","city":"Efremov"},
    {"name":"Melnik Trading","country":"Czech Republic","city":"Melnik"},
    {"name":"Changsha Trading","country":"China","city":"Changsha"},
    {"name":"Alexandria Trading","country":"Egypt","city":"Alexandria"},
    {"name":"Istanbul Trading","country":"Turkey","city":"Istanbul"},
    {"name":"Malaysia Trading","country":"Malaysia"},
    {"name":"Montoir Trading","country":"France","city":"Montoir"},
    {"name":"Gdynia Trading","country":"Poland","city":"Gdynia"},
    {"name":"Kardil Trading","country":"Turkey","city":"Kartal"},
    {"name":"Koper Trading","country":"Slovenia","city":"Koper"},
    {"name":"Ashdod Trading","country":"Israel","city":"Ashdod"},
    {"name":"Chelyabinsk Trading","country":"Russia","city":"Chelyabinsk"},
]
for c in customers_data:
    post("/customers", c)
customers = get("/customers")
cid = {}
for c in customers:
    cid[c["name"].lower()] = c["id"]
print(f"  {len(customers)} customers")

def find_cid(prefix):
    prefix = prefix.lower()
    for name, id in cid.items():
        if prefix in name:
            return id
    return None

# ── Orders from gayidvebi.xlsx ──
print("\n=== Importing Orders ===")
orders_data = [
    {"invoiceNumber":"11652","orderDate":"2025-12-10T00:00:00Z","deliveryDate":"2026-04-14T00:00:00Z","destination":"Gebze",
     "incoterms":"CFR Gebze","paymentTerms":"Nett cash","customerId":find_cid("kartali"),
     "lines":[{"productDescription":"Manganese (II) Oxide (60-62% Mn), 1250kg big bags","productType":0,"quantityTons":25,"unitPriceUsd":100,"packagingType":"1250kg./pal."}]},
    {"invoiceNumber":"241-26/3","orderDate":"2026-01-15T00:00:00Z","deliveryDate":"2026-04-14T00:00:00Z","destination":"Lakinsk",
     "incoterms":"CFR Lakinsk","paymentTerms":"Nett cash","customerId":find_cid("de hios"),
     "lines":[{"productDescription":"Manganese (II) Oxide (60-62% Mn), 25kg bags","productType":0,"quantityTons":22,"unitPriceUsd":100,"packagingType":"25kg./pal."}]},
    {"invoiceNumber":"856-158/3","orderDate":"2026-02-11T00:00:00Z","deliveryDate":"2026-04-14T00:00:00Z","destination":"Moscow",
     "incoterms":"CFR Moscow","paymentTerms":"Nett cash","customerId":find_cid("mn chemical"),
     "lines":[{"productDescription":"Manganese (II) Oxide (60-62% Mn), 25kg bags","productType":0,"quantityTons":22,"unitPriceUsd":100,"packagingType":"25kg./pal."}]},
    {"invoiceNumber":"856-162/1","orderDate":"2026-03-23T00:00:00Z","deliveryDate":"2026-04-14T00:00:00Z","destination":"Chelyabinsk",
     "incoterms":"CFR Chelyabinsk","paymentTerms":"Nett cash","customerId":find_cid("mn chemical"),
     "lines":[{"productDescription":"Manganese (II) Oxide (60-62% Mn), 1100kg bags","productType":0,"quantityTons":22,"unitPriceUsd":100,"packagingType":"1100kg./pal."}]},
    {"invoiceNumber":"10241","orderDate":"2026-02-06T00:00:00Z","deliveryDate":"2026-04-14T00:00:00Z","destination":"Valencia",
     "incoterms":"CFR Valencia","paymentTerms":"Nett cash","customerId":find_cid("norkemi"),
     "lines":[{"productDescription":"Manganese (II) Oxide (60-62% Mn), 1250kg big bags","productType":0,"quantityTons":50,"unitPriceUsd":100,"packagingType":"1250kg./pal."}]},
]
for o in orders_data:
    post("/orders", o)
print(f"  {len(get('/orders'))} orders")

# ── Warehouse orders (umbrella orders for shipment destinations) ──
print("\n=== Creating destination orders for shipments ===")
dest_map = {
    "haifa":("eriel","Haifa"), "beirut":("beirut","Beirut"), "konya":("konya","Konya"),
    "kartal":("kardil","Kartal"), "milenis":("milenis","Milenis"), "rotterdam":("norkem","Rotterdam"),
    "limassol":("limassol","Limassol"), "lakinsk":("de hios","Lakinsk"), "moscow":("mn chemical","Moscow"),
    "melnik":("melnik","Melnik"), "efremov":("efremov","Efremov"), "gebze":("kartali","Gebze"),
    "genoa":("genoa","Genoa"), "changsha":("changsha","Changsha"), "alexandria":("alexandria","Alexandria"),
    "istanbul":("istanbul","Istanbul"), "malaysia":("malaysia","Malaysia"), "montoir":("montoir","Montoir"),
    "gdynia":("gdynia","Gdynia"), "kardil":("kardil","Kartal"), "koper":("koper","Koper"),
    "ashdod":("ashdod","Ashdod"), "chelyab":("chelyabinsk","Chelyabinsk"), "pilshno":("pilshno","Pilshno"),
}
dest_orders = {}
for key, (cust_key, dest) in dest_map.items():
    cust_id = find_cid(cust_key)
    if not cust_id:
        print(f"  WARN: no customer for {cust_key}")
        continue
    result = post("/orders", {
        "invoiceNumber": f"WH-{key.upper()}", "orderDate":"2026-03-01T00:00:00Z", "destination":dest,
        "customerId":cust_id,
        "lines":[{"productDescription":"Manganese (II) Oxide (60-62% Mn)","productType":0,"quantityTons":500,"unitPriceUsd":100}]
    })
    if result:
        dest_orders[key] = result["id"]
print(f"  {len(dest_orders)} destination orders")

# ── Shipments from საწყობი.xlsx ──
print("\n=== Importing Shipments ===")
shipments_raw = [
    ("1590226","ONEU-2400506","haifa",25,"2026-03-02"),
    ("1600226","UETU-3219381","beirut",25,"2026-03-02"),
    ("1610226","QQ-958-MQ","konya",25,"2026-03-04"),
    ("1620226","XX-710-LX","kartal",25,"2026-03-04"),
    ("1010326","MSNU-2630565","milenis",25,"2026-03-02"),
    ("1020326","MEDU-6092780","rotterdam",25,"2026-03-02"),
    ("1030326","NN-546-DN","konya",25,"2026-03-04"),
    ("1040326","TCLU-2664460","rotterdam",20,"2026-03-05"),
    ("1050326","CXDU-1168957","limassol",25,"2026-03-04"),
    ("1060326","PP-594-VV","lakinsk",22,"2026-03-05"),
    ("1070326","VR-461-VV","konya",25,"2026-03-05"),
    ("1080326","UETU-3218908","rotterdam",20,"2026-03-06"),
    ("1090326","UETU-3218913","rotterdam",20,"2026-03-06"),
    ("1100326","TI-800-EM","pilshno",22,"2026-03-06"),
    ("1110326","NX-446-NN","pilshno",22,"2026-03-10"),
    ("1120326","IR-701-EM","moscow",22,"2026-03-09"),
    ("1130326","MSMU-3223874","melnik",25,"2026-03-09"),
    ("1140326","RR-783-RQ","efremov",23,"2026-03-09"),
    ("1150326","TA-444-GO","gebze",25,"2026-03-10"),
    ("1160326","TGBU-2608417","haifa",25,"2026-03-09"),
    ("1170326","UETU-3072520","genoa",25,"2026-03-10"),
    ("1180326","MSNU-2888204","genoa",25,"2026-03-10"),
    ("1190326","TCKU-1758125","genoa",25,"2026-03-11"),
    ("1200326","MRSU-0174842","changsha",25,"2026-03-13"),
    ("1210326","MRSU-0282169","changsha",25,"2026-03-12"),
    ("1220326","SUDU-1848675","changsha",25,"2026-03-12"),
    ("1230326","HASU-1469426","changsha",25,"2026-03-12"),
    ("1240326","MRKU-8790780","changsha",25,"2026-03-13"),
    ("1250326","MRKU-6501169","changsha",25,"2026-03-13"),
    ("1260326","MSKU-7329550","changsha",25,"2026-03-16"),
    ("1270326","TIIU-2126501","changsha",25,"2026-03-16"),
    ("1280326","MRKU-9116103","changsha",25,"2026-03-16"),
    ("1290326","MRSU-0420798","changsha",25,"2026-03-17"),
    ("1300326","MRSU-0324583","changsha",25,"2026-03-17"),
    ("1310326","MSKU-5851360","changsha",25,"2026-03-17"),
    ("1320326","TCLU-2551464","genoa",25,"2026-03-18"),
    ("1330326","MSDU-1888534","gdynia",25,"2026-03-29"),
    ("1340326","TCKU-3704642","alexandria",25,"2026-03-18"),
    ("1350326","34KGV425","istanbul",24,"2026-03-26"),
    ("1360326","CMAU-0397227","alexandria",25,"2026-03-18"),
    ("1370326","TIIU-2728047","alexandria",25,"2026-03-19"),
    ("1380326","SEKU-1308835","malaysia",24,"2026-03-20"),
    ("1390326","CORU-2563490","montoir",25,"2026-03-27"),
    ("1400326","JJ-710-UU","efremov",23,"2026-03-25"),
    ("1410326","MSMU-1525324","gdynia",25,"2026-03-26"),
    ("1420326","MSMU-1609359","rotterdam",24,"2026-03-26"),
    ("1430326","AA-811-CC","moscow",22,"2026-03-26"),
    ("1440326","RI-009-IL","kardil",25,"2026-03-27"),
    ("1450326","RI-050-IL","kardil",25,"2026-03-27"),
    ("1460326","MSDU-2301786","melnik",25,"2026-03-29"),
    ("1470326","MSNU-3810068","montoir",25,"2026-03-29"),
    ("1480326","MSMU-1957499","montoir",25,"2026-03-29"),
    ("1490326","BSIU-3380257","ashdod",25,"2026-03-30"),
    ("1500326","UU-404-UC","chelyab",22,"2026-03-30"),
    ("1510326","SR-825-GO","moscow",22,"2026-03-30"),
    ("1520326","DD-456-DT","chelyab",22,"2026-03-30"),
    ("1540326","ZB-100-RI","lakinsk",22,"2026-03-31"),
    ("1550326","TR-300-GE","chelyab",22,"2026-03-31"),
    # MnO2
    ("4010326","BSIU-3103519","koper",3.6,"2026-03-16"),
    ("2010326","GT-688-GG","moscow",22,"2026-03-30"),
    ("4020326","YI-672-II","moscow",22,"2026-03-31"),
]

ship_count = 0
for batch, container, dest, weight, date in shipments_raw:
    order_id = dest_orders.get(dest)
    if not order_id:
        continue
    net = int(weight * 1000)
    gross = int(weight * 1000 * 1.02)
    result = post("/shipments", {
        "batchNumber": batch, "containerNumber": container,
        "netWeightKg": net, "grossWeightKg": gross,
        "bigBagCount": 0, "smallBagCount": 0, "palletCount": 0,
        "shipmentDate": f"{date}T00:00:00Z", "orderId": order_id,
    })
    if result:
        ship_count += 1
print(f"  {ship_count} shipments imported")

# ── Summary ──
print("\n=== Final Summary ===")
print(f"Customers:  {len(get('/customers'))}")
print(f"Orders:     {len(get('/orders'))}")
print(f"Shipments:  {len(get('/shipments'))}")
print(f"Employees:  {len(get('/employees'))}")
print(f"Materials:  {len(get('/warehouse/materials'))}")
print(f"\nOpen http://localhost:4000 to see your data!")

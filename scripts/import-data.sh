#!/bin/bash
# Import real data from MN Chemical files into the CRM
API="http://localhost:8080/api"

echo "=== Importing Customers ==="
for row in \
  '{"name":"Kartali","country":"Turkey","city":"Gebze"}' \
  '{"name":"De Hios","country":"Russia","city":"Lakinsk"}' \
  '{"name":"MN Chemical Russia","country":"Russia","city":"Moscow"}' \
  '{"name":"Norkemi Quim","country":"Spain","city":"Valencia"}' \
  '{"name":"Norkem B.V.","country":"Netherlands","city":"Rotterdam"}' \
  '{"name":"Gonzalez","country":"Spain"}' \
  '{"name":"Eriel","country":"Israel","city":"Haifa"}' \
  '{"name":"Beirut Trading","country":"Lebanon","city":"Beirut"}' \
  '{"name":"Konya Chemicals","country":"Turkey","city":"Konya"}' \
  '{"name":"Milenis","country":"Greece"}' \
  '{"name":"Genoa Trading","country":"Italy","city":"Genoa"}' \
  '{"name":"Limassol Trading","country":"Cyprus","city":"Limassol"}' \
  '{"name":"Pilshno Trading","country":"Russia","city":"Pilshno"}' \
  '{"name":"Efremov Trading","country":"Russia","city":"Efremov"}' \
  '{"name":"Melnik Trading","country":"Czech Republic","city":"Melnik"}' \
  '{"name":"Changsha Trading","country":"China","city":"Changsha"}' \
  '{"name":"Alexandria Trading","country":"Egypt","city":"Alexandria"}' \
  '{"name":"Istanbul Trading","country":"Turkey","city":"Istanbul"}' \
  '{"name":"Malaysia Trading","country":"Malaysia"}' \
  '{"name":"Montoir Trading","country":"France","city":"Montoir"}' \
  '{"name":"Gdynia Trading","country":"Poland","city":"Gdynia"}' \
  '{"name":"Kardil Trading","country":"Turkey","city":"Kartal"}' \
  '{"name":"Koper Trading","country":"Slovenia","city":"Koper"}' \
  '{"name":"Ashdod Trading","country":"Israel","city":"Ashdod"}' \
  '{"name":"Chelyabinsk Trading","country":"Russia","city":"Chelyabinsk"}'
do
  curl -s -X POST "$API/customers" -H "Content-Type: application/json" -d "$row" > /dev/null
done
echo "  Done: $(curl -s $API/customers | python3 -c 'import json,sys;print(len(json.load(sys.stdin)))') customers"

echo ""
echo "=== Getting customer IDs ==="
CUSTOMERS=$(curl -s $API/customers)
get_cid() { echo "$CUSTOMERS" | python3 -c "import json,sys;d=json.load(sys.stdin);print(next((c['id'] for c in d if c['name'].lower().startswith('$1')),'')))"; }

CID_KARTALI=$(get_cid "kartali")
CID_DEHIOS=$(get_cid "de hios")
CID_MNRUS=$(get_cid "mn chemical")
CID_NORKEMI=$(get_cid "norkemi")
CID_NORKEM=$(get_cid "norkem")
CID_HAIFA=$(get_cid "eriel")
CID_BEIRUT=$(get_cid "beirut")
CID_KONYA=$(get_cid "konya")
CID_MILENIS=$(get_cid "milenis")
CID_ROTTERDAM=$(get_cid "norkem")
CID_GENOA=$(get_cid "genoa")
CID_LIMASSOL=$(get_cid "limassol")
CID_PILSHNO=$(get_cid "pilshno")
CID_EFREMOV=$(get_cid "efremov")
CID_MELNIK=$(get_cid "melnik")
CID_CHANGSHA=$(get_cid "changsha")
CID_ALEX=$(get_cid "alexandria")
CID_ISTANBUL=$(get_cid "istanbul")
CID_MALAYSIA=$(get_cid "malaysia")
CID_MONTOIR=$(get_cid "montoir")
CID_GDYNIA=$(get_cid "gdynia")
CID_KARDIL=$(get_cid "kardil")
CID_KOPER=$(get_cid "koper")
CID_ASHDOD=$(get_cid "ashdod")
CID_CHELYAB=$(get_cid "chelyabinsk")
CID_MOSCOW=$(get_cid "mn chemical")

echo "=== Importing Orders (from gayidvebi.xlsx) ==="
for row in \
  "{\"invoiceNumber\":\"11652\",\"orderDate\":\"2025-12-10\",\"deliveryDate\":\"2026-04-14\",\"destination\":\"Gebze\",\"incoterms\":\"CFR Gebze\",\"paymentTerms\":\"Nett cash\",\"customerId\":\"$CID_KARTALI\",\"lines\":[{\"productDescription\":\"Manganese (II) Oxide (60-62% Mn), 1250kg big bags\",\"productType\":0,\"quantityTons\":25,\"unitPriceUsd\":100,\"packagingType\":\"1250kg./pal.\"}]}" \
  "{\"invoiceNumber\":\"241-26/3\",\"orderDate\":\"2026-01-15\",\"deliveryDate\":\"2026-04-14\",\"destination\":\"Lakinsk\",\"incoterms\":\"CFR Lakinsk\",\"paymentTerms\":\"Nett cash\",\"customerId\":\"$CID_DEHIOS\",\"lines\":[{\"productDescription\":\"Manganese (II) Oxide (60-62% Mn), 25kg bags\",\"productType\":0,\"quantityTons\":22,\"unitPriceUsd\":100,\"packagingType\":\"25kg./pal.\"}]}" \
  "{\"invoiceNumber\":\"856-158/3\",\"orderDate\":\"2026-02-11\",\"deliveryDate\":\"2026-04-14\",\"destination\":\"Moscow\",\"incoterms\":\"CFR Moscow\",\"paymentTerms\":\"Nett cash\",\"customerId\":\"$CID_MNRUS\",\"lines\":[{\"productDescription\":\"Manganese (II) Oxide (60-62% Mn), 25kg bags\",\"productType\":0,\"quantityTons\":22,\"unitPriceUsd\":100,\"packagingType\":\"25kg./pal.\"}]}" \
  "{\"invoiceNumber\":\"856-162/1\",\"orderDate\":\"2026-03-23\",\"deliveryDate\":\"2026-04-14\",\"destination\":\"Chelyabinsk\",\"incoterms\":\"CFR Chelyabinsk\",\"paymentTerms\":\"Nett cash\",\"customerId\":\"$CID_MNRUS\",\"lines\":[{\"productDescription\":\"Manganese (II) Oxide (60-62% Mn), 1100kg bags\",\"productType\":0,\"quantityTons\":22,\"unitPriceUsd\":100,\"packagingType\":\"1100kg./pal.\"}]}" \
  "{\"invoiceNumber\":\"10241\",\"orderDate\":\"2026-02-06\",\"deliveryDate\":\"2026-04-14\",\"destination\":\"Valencia\",\"incoterms\":\"CFR Valencia\",\"paymentTerms\":\"Nett cash\",\"customerId\":\"$CID_NORKEMI\",\"lines\":[{\"productDescription\":\"Manganese (II) Oxide (60-62% Mn), 1250kg big bags\",\"productType\":0,\"quantityTons\":50,\"unitPriceUsd\":100,\"packagingType\":\"1250kg./pal.\"}]}"
do
  curl -s -X POST "$API/orders" -H "Content-Type: application/json" -d "$row" > /dev/null
done
echo "  Done: $(curl -s $API/orders | python3 -c 'import json,sys;print(len(json.load(sys.stdin)))') orders"

echo ""
echo "=== Creating generic warehouse orders for shipments ==="
# Create umbrella orders for the warehouse shipments grouped by destination
declare -A DEST_ORDERS
for dest_cid in \
  "haifa:$CID_HAIFA:Haifa:WH-HAIFA" \
  "beirut:$CID_BEIRUT:Beirut:WH-BEIRUT" \
  "konya:$CID_KONYA:Konya:WH-KONYA" \
  "kartal:$CID_KARDIL:Kartal:WH-KARTAL" \
  "milenis:$CID_MILENIS:Milenis:WH-MILENIS" \
  "rotterdam:$CID_ROTTERDAM:Rotterdam:WH-ROTTERDAM" \
  "limassol:$CID_LIMASSOL:Limassol:WH-LIMASSOL" \
  "lakinsk:$CID_DEHIOS:Lakinsk:WH-LAKINSK" \
  "moscow:$CID_MOSCOW:Moscow:WH-MOSCOW" \
  "melnik:$CID_MELNIK:Melnik:WH-MELNIK" \
  "efremov:$CID_EFREMOV:Efremov:WH-EFREMOV" \
  "gebze:$CID_KARTALI:Gebze:WH-GEBZE" \
  "genoa:$CID_GENOA:Genoa:WH-GENOA" \
  "changsha:$CID_CHANGSHA:Changsha:WH-CHANGSHA" \
  "alexandria:$CID_ALEX:Alexandria:WH-ALEXANDRIA" \
  "istanbul:$CID_ISTANBUL:Istanbul:WH-ISTANBUL" \
  "malaysia:$CID_MALAYSIA:Malaysia:WH-MALAYSIA" \
  "montoir:$CID_MONTOIR:Montoir:WH-MONTOIR" \
  "gdynia:$CID_GDYNIA:Gdynia:WH-GDYNIA" \
  "kardil:$CID_KARDIL:Kartal:WH-KARDIL" \
  "koper:$CID_KOPER:Koper:WH-KOPER" \
  "ashdod:$CID_ASHDOD:Ashdod:WH-ASHDOD" \
  "chelyab:$CID_CHELYAB:Chelyabinsk:WH-CHELYAB" \
  "pilshno:$CID_PILSHNO:Pilshno:WH-PILSHNO"
do
  IFS=: read -r key cid dest inv <<< "$dest_cid"
  OID=$(curl -s -X POST "$API/orders" -H "Content-Type: application/json" -d "{\"invoiceNumber\":\"$inv\",\"orderDate\":\"2026-03-01\",\"destination\":\"$dest\",\"customerId\":\"$cid\",\"lines\":[{\"productDescription\":\"Manganese (II) Oxide (60-62% Mn)\",\"productType\":0,\"quantityTons\":100,\"unitPriceUsd\":100}]}" | python3 -c "import json,sys;print(json.load(sys.stdin)['id'])")
  DEST_ORDERS[$key]=$OID
done
echo "  Created $(echo ${#DEST_ORDERS[@]}) destination orders"

echo ""
echo "=== Importing Shipments (from საწყობი.xlsx batch outgoing) ==="
SHIP_COUNT=0

import_shipment() {
  local batch="$1" container="$2" dest="$3" weight="$4" date="$5"
  local order_id="${DEST_ORDERS[$dest]}"
  if [ -z "$order_id" ]; then return; fi
  if [ -z "$container" ] || [ "$container" = "null" ]; then return; fi

  local net_kg=$(python3 -c "print(int($weight*1000))")
  local gross_kg=$(python3 -c "print(int($weight*1000*1.02))")  # ~2% tare

  curl -s -X POST "$API/shipments" -H "Content-Type: application/json" -d "{
    \"batchNumber\":\"$batch\",\"containerNumber\":\"$container\",
    \"netWeightKg\":$net_kg,\"grossWeightKg\":$gross_kg,
    \"bigBagCount\":0,\"smallBagCount\":0,\"palletCount\":0,
    \"shipmentDate\":\"${date}T00:00:00\",\"orderId\":\"$order_id\"
  }" > /dev/null
  SHIP_COUNT=$((SHIP_COUNT+1))
}

# MnO shipments (from extracted data)
import_shipment "1590226" "ONEU-2400506" "haifa" 25 "2026-03-02"
import_shipment "1600226" "UETU-3219381" "beirut" 25 "2026-03-02"
import_shipment "1610226" "QQ-958-MQ" "konya" 25 "2026-03-04"
import_shipment "1620226" "XX-710-LX" "kartal" 25 "2026-03-04"
import_shipment "1010326" "MSNU-2630565" "milenis" 25 "2026-03-02"
import_shipment "1020326" "MEDU-6092780" "rotterdam" 25 "2026-03-02"
import_shipment "1030326" "NN-546-DN" "konya" 25 "2026-03-04"
import_shipment "1040326" "TCLU-2664460" "rotterdam" 20 "2026-03-05"
import_shipment "1050326" "CXDU-1168957" "limassol" 25 "2026-03-04"
import_shipment "1060326" "PP-594-VV" "lakinsk" 22 "2026-03-05"
import_shipment "1070326" "VR-461-VV" "konya" 25 "2026-03-05"
import_shipment "1080326" "UETU-3218908" "rotterdam" 20 "2026-03-06"
import_shipment "1090326" "UETU-3218913" "rotterdam" 20 "2026-03-06"
import_shipment "1100326" "TI-800-EM" "pilshno" 22 "2026-03-06"
import_shipment "1110326" "NX-446-NN" "pilshno" 22 "2026-03-10"
import_shipment "1120326" "IR-701-EM" "moscow" 22 "2026-03-09"
import_shipment "1130326" "MSMU-3223874" "melnik" 25 "2026-03-09"
import_shipment "1140326" "RR-783-RQ" "efremov" 23 "2026-03-09"
import_shipment "1150326" "TA-444-GO" "gebze" 25 "2026-03-10"
import_shipment "1160326" "TGBU-2608417" "haifa" 25 "2026-03-09"
import_shipment "1170326" "UETU-3072520" "genoa" 25 "2026-03-10"
import_shipment "1180326" "MSNU-2888204" "genoa" 25 "2026-03-10"
import_shipment "1190326" "TCKU-1758125" "genoa" 25 "2026-03-11"
import_shipment "1200326" "MRSU-0174842" "changsha" 25 "2026-03-13"
import_shipment "1210326" "MRSU-0282169" "changsha" 25 "2026-03-12"
import_shipment "1220326" "SUDU-1848675" "changsha" 25 "2026-03-12"
import_shipment "1230326" "HASU-1469426" "changsha" 25 "2026-03-12"
import_shipment "1240326" "MRKU-8790780" "changsha" 25 "2026-03-13"
import_shipment "1250326" "MRKU-6501169" "changsha" 25 "2026-03-13"
import_shipment "1260326" "MSKU-7329550" "changsha" 25 "2026-03-16"
import_shipment "1270326" "TIIU-2126501" "changsha" 25 "2026-03-16"
import_shipment "1280326" "MRKU-9116103" "changsha" 25 "2026-03-16"
import_shipment "1290326" "MRSU-0420798" "changsha" 25 "2026-03-17"
import_shipment "1300326" "MRSU-0324583" "changsha" 25 "2026-03-17"
import_shipment "1310326" "MSKU-5851360" "changsha" 25 "2026-03-17"
import_shipment "1320326" "TCLU-2551464" "genoa" 25 "2026-03-18"
import_shipment "1330326" "MSDU-1888534" "gdynia" 25 "2026-03-29"
import_shipment "1340326" "TCKU-3704642" "alexandria" 25 "2026-03-18"
import_shipment "1350326" "34KGV425" "istanbul" 24 "2026-03-26"
import_shipment "1360326" "CMAU-0397227" "alexandria" 25 "2026-03-18"
import_shipment "1370326" "TIIU-2728047" "alexandria" 25 "2026-03-19"
import_shipment "1380326" "SEKU-1308835" "malaysia" 24 "2026-03-20"
import_shipment "1390326" "CORU-2563490" "montoir" 25 "2026-03-27"
import_shipment "1400326" "JJ-710-UU" "efremov" 23 "2026-03-25"
import_shipment "1410326" "MSMU-1525324" "gdynia" 25 "2026-03-26"
import_shipment "1420326" "MSMU-1609359" "rotterdam" 24 "2026-03-26"
import_shipment "1430326" "AA-811-CC" "moscow" 22 "2026-03-26"
import_shipment "1440326" "RI-009-IL" "kardil" 25 "2026-03-27"
import_shipment "1450326" "RI-050-IL" "kardil" 25 "2026-03-27"
import_shipment "1460326" "MSDU-2301786" "melnik" 25 "2026-03-29"
import_shipment "1470326" "MSNU-3810068" "montoir" 25 "2026-03-29"
import_shipment "1480326" "MSMU-1957499" "montoir" 25 "2026-03-29"
import_shipment "1490326" "BSIU-3380257" "ashdod" 25 "2026-03-30"
import_shipment "1500326" "UU-404-UC" "chelyab" 22 "2026-03-30"
import_shipment "1510326" "SR-825-GO" "moscow" 22 "2026-03-30"
import_shipment "1520326" "DD-456-DT" "chelyab" 22 "2026-03-30"
import_shipment "1540326" "ZB-100-RI" "lakinsk" 22 "2026-03-31"
import_shipment "1550326" "TR-300-GE" "chelyab" 22 "2026-03-31"

# MnO2 shipments
import_shipment "4010326" "BSIU-3103519" "koper" 3.6 "2026-03-16"
import_shipment "2010226" "BSIU-3103519-2" "koper" 20.4 "2026-03-16"
import_shipment "2010326" "GT-688-GG" "moscow" 22 "2026-03-30"
import_shipment "4020326" "YI-672-II" "moscow" 22 "2026-03-31"

echo "  Done: $SHIP_COUNT shipments imported"

echo ""
echo "=== Summary ==="
echo "Customers: $(curl -s $API/customers | python3 -c 'import json,sys;print(len(json.load(sys.stdin)))')"
echo "Orders: $(curl -s $API/orders | python3 -c 'import json,sys;print(len(json.load(sys.stdin)))')"
echo "Shipments: $(curl -s $API/shipments | python3 -c 'import json,sys;print(len(json.load(sys.stdin)))')"
echo "Employees: $(curl -s $API/employees | python3 -c 'import json,sys;print(len(json.load(sys.stdin)))')"
echo "Attendance: $(curl -s "$API/attendance?from=2026-04-01&to=2026-04-30" | python3 -c 'import json,sys;print(len(json.load(sys.stdin)))')"
echo "Materials: $(curl -s $API/warehouse/materials | python3 -c 'import json,sys;print(len(json.load(sys.stdin)))')"
echo ""
echo "=== Import complete! Open http://localhost:4000 to see your data ==="

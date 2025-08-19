import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useNavigation, useRoute } from '@react-navigation/native';
const VendorList = [
    {
        "value": "Chetak",
        "slug": "chetak",
        "jsonName": "chetak-products.json",
        "emptyColumn": true,
        "databaseName": "chetakproducts"
    },
    {
        "value": "kashmir_snacks_international_inc",
        "slug": "kashmir_snacks_international_inc",
        "jsonName": "kashmir_snacks_international_inc.json",
        "emptyColumn": false,
        "databaseName": "kashmir_snacks_international_inc"
    },
    {
        "value": "alsaqr_distribution_llc",
        "slug": "alsaqr_distribution_llc",
        "jsonName": "alsaqr_distribution_llc.json",
        "emptyColumn": false,
        "databaseName": "alsaqr_distribution_llc"
    },
    {
        "value": "jalaram_produce_2",
        "slug": "jalaram_produce_2",
        "jsonName": "jalaram_produce_2.json",
        "emptyColumn": false,
        "databaseName": "jalaram_produce_2"
    },
    {
        "value": "aahubarah usa",
        "slug": "aahubarah-usa",
        "jsonName": "aahubarah-usa.json",
        "emptyColumn": false,
        "databaseName": "aahubarah usa"
    },
    {
        "value": "aahubarah usa1",
        "slug": "aahubarah-usa1",
        "jsonName": "aahubarah-usa1.json",
        "emptyColumn": false,
        "databaseName": "aahubarah usa1"
    },
    {
        "value": "bcs",
        "slug": "bcs",
        "jsonName": "bcs.json",
        "emptyColumn": false,
        "databaseName": "bcs"
    },
    {
        "value": "rons_beverage_inc",
        "slug": "rons_beverage_inc",
        "jsonName": "rons_beverage_inc.json",
        "emptyColumn": false,
        "databaseName": "rons_beverage_inc"
    },
    {
        "value": "jmr_distributors_llc",
        "slug": "jmr_distributors_llc",
        "jsonName": "jmr_distributors_llc.json",
        "emptyColumn": false,
        "databaseName": "jmr_distributors_llc"
    },
    {
        "value": "Adelman foods",
        "slug": "adelman-foods",
        "jsonName": "adelaman-food.json",
        "emptyColumn": false,
        "databaseName": "adelamanfoods"
    },
    {
        "value": "osr",
        "slug": "osr",
        "jsonName": "osr.json",
        "emptyColumn": false,
        "databaseName": "osr"
    },
    {
        "value": "Advance Foods",
        "slug": "advance-foods",
        "jsonName": "advance-foods.json",
        "emptyColumn": false,
        "databaseName": "advancefoods"
    },
    {
        "value": "Aliments",
        "slug": "aliments",
        "jsonName": "aliments.json",
        "emptyColumn": true,
        "databaseName": "aliments"
    },
    {
        "value": "Amtrade",
        "slug": "amtrade",
        "jsonName": "amtrade.json",
        "emptyColumn": false,
        "databaseName": "amtrades"
    },
    {
        "value": "anmol_distributor2",
        "slug": "anmol_distributor2",
        "jsonName": "anmol_distributor2",
        "emptyColumn": false,
        "databaseName": "anmol_distributor2"
    },
    {
        "value": "Anns eco store",
        "slug": "anns-eco-store",
        "jsonName": "anns-eco-store.json",
        "emptyColumn": false,
        "databaseName": "annsecostores"
    },
    {
        "value": "Anns Foods",
        "slug": "anns-foods",
        "jsonName": "anns-foods.json",
        "emptyColumn": false,
        "databaseName": "annsfoods"
    },
    {
        "value": "gurme guru",
        "slug": "gurme-guru",
        "jsonName": "gurme-guru.json",
        "emptyColumn": true,
        "databaseName": "gurme guru"
    },
    {
        "value": "gurme guru1",
        "slug": "gurme-guru1",
        "jsonName": "gurme-guru1.json",
        "emptyColumn": false,
        "databaseName": "gurme guru1"
    },
    {
        "value": "Soko Packaging",
        "slug": "soko-packaging",
        "jsonName": "soko-packaging.json",
        "emptyColumn": false,
        "databaseName": "sokopackaging"
    },
    {
        "value": "Babco foods",
        "slug": "babco-foods",
        "jsonName": "babco.json",
        "emptyColumn": false,
        "databaseName": "babcos"
    },
    {
        "value": "Baraka cold",
        "slug": "baraka-cold",
        "jsonName": "baraka-cold.json",
        "emptyColumn": false,
        "databaseName": "barakacolds"
    },
    {
        "value": "Baroody",
        "slug": "baroody",
        "jsonName": "baroody.json",
        "emptyColumn": true,
        "databaseName": "baroodies"
    },
    {
        "value": "Bedessee",
        "slug": "bedessee",
        "jsonName": "bedessee.json",
        "emptyColumn": false,
        "databaseName": "bedessees"
    },
    {
        "value": "Best Foods",
        "slug": "best-foods",
        "jsonName": "best-foods.json",
        "emptyColumn": true,
        "databaseName": "bestfoods"
    },
    {
        "value": "Dara food LLC",
        "slug": "dara-food",
        "jsonName": "dara.json",
        "emptyColumn": false,
        "databaseName": "daras"
    },
    {
        "value": "Dawn food",
        "slug": "dawn-food",
        "jsonName": "dawn-food.json",
        "emptyColumn": false,
        "databaseName": "dawnfoods"
    },
    {
        "value": "Delight distribution",
        "slug": "delight-distribution",
        "jsonName": "delight-distrubution.json",
        "emptyColumn": false,
        "databaseName": "delightdistrubutions"
    },
    {
        "value": "Dsa snacks",
        "slug": "dsa-snacks",
        "jsonName": "dsa-snacks.json",
        "emptyColumn": false,
        "databaseName": "dsasnacks"
    },
    {
        "value": "East end",
        "slug": "east-end",
        "jsonName": "east-end.json",
        "emptyColumn": false,
        "databaseName": "eastends"
    },
    {
        "value": "Empire food importers",
        "slug": "empire-food-importers",
        "jsonName": "empire-food-importers.json",
        "emptyColumn": false,
        "databaseName": "empirefoodimporters"
    },
    {
        "value": "Family five",
        "slug": "family-five",
        "jsonName": "family-five.json",
        "emptyColumn": false,
        "databaseName": "familyfives"
    },
    {
        "value": "Gaint Farm",
        "slug": "gaint-farm",
        "jsonName": "gaint-farm.json",
        "emptyColumn": true,
        "databaseName": "gaintfarms"
    },
    {
        "value": "Galil imports",
        "slug": "galil",
        "jsonName": "galil-importing.json",
        "emptyColumn": false,
        "databaseName": "galilimportings"
    },
    {
        "value": "goyal_group",
        "slug": "goyal_group",
        "jsonName": "goyal_group.json",
        "emptyColumn": false,
        "databaseName": "goyal_group"
    },
    {
        "value": "malba_trading",
        "slug": "malba_trading",
        "jsonName": "malba_trading.json",
        "emptyColumn": false,
        "databaseName": "malba_trading"
    },
    {
        "value": "los_olivos_ltd_2",
        "slug": "los_olivos_ltd",
        "jsonName": "los_olivos_ltd.json",
        "emptyColumn": false,
        "databaseName": "los_olivos_ltd"
    },
    {
        "value": "j_&_n_distribution",
        "slug": "j_&_n_distribution",
        "jsonName": "j_&_n_distribution.json",
        "emptyColumn": true,
        "databaseName": "j_&_n_distribution"
    },
    {
        "value": "Pepsi_cola_bottling_company",
        "slug": "Pepsi_cola_bottling_company",
        "jsonName": "Pepsi_cola_bottling_company.json",
        "emptyColumn": false,
        "databaseName": "Pepsi_cola_bottling_company"
    },
    {
        "value": "spice_n_more_crop",
        "slug": "spice_n_more_crop",
        "jsonName": "spice_n_more_crop.json",
        "emptyColumn": false,
        "databaseName": "spice_n_more_crop"
    },
    {
        "value": "z2k_inc",
        "slug": "z2k_inc",
        "jsonName": "z2k_inc.json",
        "emptyColumn": false,
        "databaseName": "z2k_inc"
    },
    {
        "value": "global_futura_inc",
        "slug": "global_futura_inc",
        "jsonName": "global_futura_inc.json",
        "emptyColumn": false,
        "databaseName": "global_futura_inc"
    },
    {
        "value": "fresh_food",
        "slug": "fresh_food",
        "jsonName": "fresh_food.json",
        "emptyColumn": false,
        "databaseName": "fresh_food"
    },
    {
        "value": "jacks_eggs",
        "slug": "jacks_eggs",
        "jsonName": "jacks_eggs.json",
        "emptyColumn": false,
        "databaseName": "jacks_eggs"
    },
    {
        "value": "Hellenic",
        "slug": "hellenic",
        "jsonName": "hellenic.json",
        "emptyColumn": false,
        "databaseName": "hellenics"
    },
    {
        "value": "Cream O Land",
        "slug": "cream-o-land",
        "jsonName": "cream-o-land.json",
        "emptyColumn": true,
        "databaseName": "cream-o-land"
    },
    {
        "value": "uniware_3",
        "slug": "uniware_3",
        "jsonName": "uniware_3.json",
        "emptyColumn": false,
        "databaseName": "uniware_3"
    },
    {
        "value": "chawdhury_farm_and_meat_proc",
        "slug": "chawdhury_farm_and_meat_proc",
        "jsonName": "chawdhury_farm_and_meat_proc.json",
        "emptyColumn": false,
        "databaseName": "chawdhury_farm_and_meat_proc"
    },
    {
        "value": "Hill top farms",
        "slug": "hill-top-farms",
        "jsonName": "hill-top-farms.json",
        "emptyColumn": false,
        "databaseName": "hilltopfarms"
    },
    {
        "value": "k_&_s_wholesale",
        "slug": "k_&_s_wholesale",
        "jsonName": "k_&_s_wholesale.json",
        "emptyColumn": false,
        "databaseName": "k_&_s_wholesale"
    },
    {
        "value": "armata",
        "slug": "armata",
        "jsonName": "armata.json",
        "emptyColumn": true,
        "databaseName": "armata"
    },
    {
        "value": "samar_riar_trading_corp",
        "slug": "samar_riar_trading_corp",
        "jsonName": "samar_riar_trading_corp.json",
        "emptyColumn": true,
        "databaseName": "samar_riar_trading_corp"
    },
    {
        "value": "afn_broker_llc",
        "slug": "afn_broker_llc",
        "jsonName": "afn_broker_llc.json",
        "emptyColumn": false,
        "databaseName": "afn_broker_llc"
    },
    {
        "value": "bakewel",
        "slug": "bakewel",
        "jsonName": "bakewel.json",
        "emptyColumn": false,
        "databaseName": "bakewel"
    },
    {
        "value": "a_&_a_fresh_bread",
        "slug": "a_&_a_fresh_bread",
        "jsonName": "a_&_a_fresh_bread.json",
        "emptyColumn": false,
        "databaseName": "a_&_a_fresh_bread"
    },
    {
        "value": "House of spices",
        "slug": "house-of-spices",
        "jsonName": "house-spices.json",
        "emptyColumn": false,
        "databaseName": "housespices"
    },
    {
        "value": "Indian food & spices",
        "slug": "indian-food-and-spices",
        "jsonName": "india-food-spices.json",
        "emptyColumn": false,
        "databaseName": "indiafoodspices"
    },
    {
        "value": "Concept Food",
        "slug": "concept-food-US",
        "jsonName": "concept-food-us.json",
        "emptyColumn": false,
        "databaseName": "conceptfoodus"
    },
    {
        "value": "Aadya Foods",
        "slug": "aadya-foods",
        "jsonName": "aadya-foods.json",
        "emptyColumn": false,
        "databaseName": "aadyafoods"
    },
    {
        "value": "Annam Foods",
        "slug": "annam-foods",
        "jsonName": "annam-foods.json",
        "emptyColumn": false,
        "databaseName": "annamfoods"
    },
    {
        "value": "Tropicana",
        "slug": "tropicana",
        "jsonName": "tropicana.json",
        "emptyColumn": false,
        "databaseName": "tropicana"
    },
    {
        "value": "Indian spice trading",
        "slug": "indian-spice-trading",
        "jsonName": "indian-spice-trading.json",
        "emptyColumn": true,
        "databaseName": "indianspicetradings"
    },
    {
        "value": "Jaan distributors",
        "slug": "jaan-distributors",
        "jsonName": "jaan-dist.json",
        "emptyColumn": false,
        "databaseName": "jaandists"
    },
    {
        "value": "jcw import",
        "slug": "jcw-import",
        "jsonName": "jcw-import.json",
        "emptyColumn": false,
        "databaseName": "jcw import"
    },
    {
        "value": "joy gourmet foods",
        "slug": "joy-gourment-foods",
        "jsonName": "joy-gourmet-foods.json",
        "emptyColumn": false,
        "databaseName": "joygourmetfoods"
    },
    {
        "value": "new rotika",
        "slug": "new-rotika",
        "jsonName": "new-rotika.json",
        "emptyColumn": false,
        "databaseName": "new rotika"
    },
    {
        "value": "slt_foods",
        "slug": "slt-foods",
        "jsonName": "slt-foods.json",
        "emptyColumn": true,
        "databaseName": "slt_foods"
    },
    {
        "value": "slt_foods1",
        "slug": "slt_foods1",
        "jsonName": "slt_foods1.json",
        "emptyColumn": false,
        "databaseName": "slt_foods1"
    },
    {
        "value": "food & more",
        "slug": "food-&-more",
        "jsonName": "food-&-more.json",
        "emptyColumn": false,
        "databaseName": "food & more"
    },
    {
        "value": "food-n-more",
        "slug": "food-n-more",
        "jsonName": "food-n-more.json",
        "emptyColumn": false,
        "databaseName": "food-n-more"
    },
    {
        "value": "continental_paper",
        "slug": "continental-paper",
        "jsonName": "continental-paper.json",
        "emptyColumn": true,
        "databaseName": "continental_paper"
    },
    {
        "value": "mercantile international",
        "slug": "mercantile-international",
        "jsonName": "mercantile-international.json",
        "emptyColumn": false,
        "databaseName": "mercantile-international"
    },
    {
        "value": "KM Distribution",
        "slug": "km-distribution-usa",
        "jsonName": "km-dist-usa.json",
        "emptyColumn": false,
        "databaseName": "kmdistusas"
    },
    {
        "value": "Tuscan",
        "slug": "tuscan",
        "jsonName": "tuscan.json",
        "emptyColumn": false,
        "databaseName": "tuscan"
    },
    {
        "value": "Triboro Wholesale",
        "slug": "triboro-wholesale",
        "jsonName": "triboro-wholesale.json",
        "emptyColumn": false,
        "databaseName": "triborowholesale"
    },
    {
        "value": "Bhavani Fruit Vegetables",
        "slug": "bhavani-fruit-vegetables",
        "jsonName": "bhavani-fruit-vegetables.json",
        "emptyColumn": false,
        "databaseName": "bhavanifruitvegatbles"
    },
    {
        "value": "Koryeo",
        "slug": "koryeo",
        "jsonName": "koryeo-foods.json",
        "emptyColumn": false,
        "databaseName": "koryeofoods"
    },
    {
        "value": "grace kennedy",
        "slug": "grace-kennedy",
        "jsonName": "grace-kennedy.json",
        "emptyColumn": false,
        "databaseName": "gracekennedy"
    },
    {
        "value": "sensational_foods",
        "slug": "sensational_foods",
        "jsonName": "sensational_foods.json",
        "emptyColumn": false,
        "databaseName": "sensational_foods"
    },
    {
        "value": "derle farms",
        "slug": "derle-farms",
        "jsonName": "derle-farms.json",
        "emptyColumn": false,
        "databaseName": "derle-farmsr"
    },
    {
        "value": "wonderful sales",
        "slug": "wonderful-sales",
        "jsonName": "wonderful sales.json",
        "emptyColumn": false,
        "databaseName": "wonderful sales"
    },
    {
        "value": "Krinos foods",
        "slug": "krinos-foods",
        "jsonNaseame": "krino-foods.json",
        "emptyColumn": false,
        "databaseName": "krinofoods"
    },
    {
        "value": "Leblon foods",
        "slug": "leblon-foods",
        "jsonName": "leblon.json",
        "emptyColumn": false,
        "databaseName": "leblons"
    },
    {
        "value": "Rajbhog Food",
        "slug": "rajbhog-food",
        "jsonName": "rajbhog-food.json",
        "emptyColumn": false,
        "databaseName": "rajbhogfood"
    },
    {
        "value": "solid trade",
        "slug": "solid-trade",
        "jsonName": "solid-trade.json",
        "emptyColumn": false,
        "databaseName": "solid trade"
    },
    {
        "value": "Maharaja food importers",
        "slug": "maharaja-food-importers",
        "jsonName": "maharaja.json",
        "emptyColumn": false,
        "databaseName": "maharajas"
    },
    {
        "value": "meenaxi enterprise",
        "slug": "meenaxi-enterprise",
        "jsonName": "meenaxi-enterprise.json",
        "emptyColumn": false,
        "databaseName": "meenaxi enterprise"
    },
    {
        "value": "meenaxi enterprise1",
        "slug": "meenaxi-enterprise1",
        "jsonName": "meenaxi-enterprise1.json",
        "emptyColumn": false,
        "databaseName": "meenaxi enterprise1"
    },
    {
        "value": "material_connexion",
        "slug": "material_connexion",
        "jsonName": "material_connexion.json",
        "emptyColumn": true,
        "databaseName": "material_connexion"
    },
    {
        "value": "Moda food",
        "slug": "moda-food",
        "jsonName": "moda-food-ny.json",
        "emptyColumn": true,
        "databaseName": "modafoodnies"
    },
    {
        "value": "Nassau candy",
        "slug": "nassau-candy",
        "jsonName": "nassau.json",
        "emptyColumn": false,
        "databaseName": "nassaus"
    },
    {
        "value": "Crestwood Farms",
        "slug": "crestwood-farms",
        "jsonName": "crestwood-farms.json",
        "emptyColumn": false,
        "databaseName": "crestwoodfarms"
    },
    {
        "value": "New york wholesale",
        "slug": "new-york-wholesale",
        "jsonName": "new-york-wholesale.json",
        "emptyColumn": false,
        "databaseName": "newyorkwholesales"
    },
    {
        "value": "Nirav Indian groceries1",
        "slug": "nirav-indian-groceries1",
        "jsonName": "nirav-indian-groceries1.json",
        "emptyColumn": false,
        "databaseName": "niravindiangroceries1"
    },
    {
        "value": "alduz_food_imports",
        "slug": "alduz_food_imports",
        "jsonName": "alduz_food_imports.json",
        "emptyColumn": true,
        "databaseName": "alduz_food_imports"
    },
    {
        "value": "modina_foods",
        "slug": "modina_foods",
        "jsonName": "modina_foods.json",
        "emptyColumn": false,
        "databaseName": "modina_foods"
    },
    {
        "value": "produce-n-more1",
        "slug": "produce-n-more1",
        "jsonName": "produce-n-more1.json",
        "emptyColumn": false,
        "databaseName": "produce-n-more1"
    },
    {
        "value": "Nupur trading",
        "slug": "nupur-trading",
        "jsonName": "nupur.json",
        "emptyColumn": false,
        "databaseName": "nupurs"
    },
    {
        "value": "ny_zara_food",
        "slug": "ny_zara_food",
        "jsonName": "ny_zara_food.json",
        "emptyColumn": false,
        "databaseName": "ny_zara_food"
    },
    {
        "value": "hmt_motor_carrier",
        "slug": "hmt_motor_carrier",
        "jsonName": "hmt_motor_carrier.json",
        "emptyColumn": false,
        "databaseName": "hmt_motor_carrier"
    },
    {
        "value": "quantum_express_crop",
        "slug": "quantum_express_crop",
        "jsonName": "quantum_express_crop.json",
        "emptyColumn": false,
        "databaseName": "quantum_express_crop"
    },
    {
        "value": "sweet_house_llc",
        "slug": "sweet_house_llc",
        "jsonName": "sweet_house_llc.json",
        "emptyColumn": false,
        "databaseName": "sweet_house_llc"
    },
    {
        "value": "ethnic_foods",
        "slug": "ethnic_foods",
        "jsonName": "ethnic_foods.json",
        "emptyColumn": false,
        "databaseName": "ethnic_foods"
    },
    {
        "value": "subisco_inc",
        "slug": "subisco_inc",
        "jsonName": "subisco_inc.json",
        "emptyColumn": false,
        "databaseName": "subisco_inc"
    },
    {
        "value": "akma_food_spices",
        "slug": "akma_food_spices",
        "jsonName": "akma_food_spices.json",
        "emptyColumn": true,
        "databaseName": "akma_food_spices"
    },
    {
        "value": "On time distribution",
        "slug": "on-time-distribution",
        "jsonName": "ontime.json",
        "emptyColumn": false,
        "databaseName": "ontimes"
    },
    {
        "value": "Optima foods",
        "slug": "optima-foods",
        "jsonName": "optimal.json",
        "emptyColumn": false,
        "databaseName": "optimals"
    },
    {
        "value": "PGL trade",
        "slug": "pgl-trade",
        "jsonName": "pgl-trade.json",
        "emptyColumn": false,
        "databaseName": "pgltrades"
    },
    {
        "value": "Preferred beverage",
        "slug": "referred-beverage",
        "jsonName": "preferred-beverage.json",
        "emptyColumn": false,
        "databaseName": "preferredbeverages"
    },
    {
        "value": "Produce n More",
        "slug": "produce-n-more",
        "jsonName": "produce-n-more.json",
        "emptyColumn": false,
        "databaseName": "producenmores"
    },
    {
        "value": "Pure Ghee",
        "slug": "pure-ghee",
        "jsonName": "pure-ghee.json",
        "emptyColumn": false,
        "databaseName": "pureghees"
    },
    {
        "value": "Putul distributors",
        "slug": "putul-distributors",
        "jsonName": "putull-dist.json",
        "emptyColumn": false,
        "databaseName": "putulldists"
    },
    {
        "value": "Radhey foods",
        "slug": "radhey-food",
        "jsonName": "radhey-foods.json",
        "emptyColumn": false,
        "databaseName": "radheyfoods"
    },
    {
        "value": "Rane music",
        "slug": "ranemusic",
        "jsonName": "rane-music.json",
        "emptyColumn": false,
        "databaseName": "ranemusics"
    },
    {
        "value": "Rite source corp",
        "slug": "ritesource-corp",
        "jsonName": "rite-source-corp.json",
        "emptyColumn": false,
        "databaseName": "ritesourcecorps"
    },
    {
        "value": "Ron foods",
        "slug": "ron-foods",
        "jsonName": "ron-foods.json",
        "emptyColumn": false,
        "databaseName": "ronfoods"
    },
    {
        "value": "Apna Bazar",
        "slug": "apna-bazar",
        "jsonName": "apna-bazar.json",
        "emptyColumn": false,
        "databaseName": "apnabazar"
    },
    {
        "value": "Sankaj",
        "slug": "sankaj",
        "jsonName": "sankaj.json",
        "emptyColumn": false,
        "databaseName": "sankajs"
    },
    {
        "value": "Sea mark",
        "slug": "sea-mark",
        "jsonName": "seamark.json",
        "emptyColumn": false,
        "databaseName": "seamarks"
    },
    {
        "value": "Shakti group",
        "slug": "shakti-group-usa",
        "jsonName": "shakti.json",
        "emptyColumn": false,
        "databaseName": "shaktis"
    },
    {
        "value": "Shata traders",
        "slug": "shata-traders",
        "jsonName": "shata.json",
        "emptyColumn": false,
        "databaseName": "shatas"
    },
    {
        "value": "Shine foods",
        "slug": "shine-foods",
        "jsonName": "shine.json",
        "emptyColumn": false,
        "databaseName": "shines"
    },
    {
        "value": "Shreeji Jay/Shreeji  ",
        "slug": "shreeji-jay",
        "jsonName": "shreeji-jay.json",
        "emptyColumn": false,
        "databaseName": "shreejijay"
    },
    {
        "value": "Singh-and-singh",
        "slug": "singh-and-singh",
        "jsonName": "singh-and-singh.json",
        "emptyColumn": false,
        "databaseName": "singhandsingh"
    },
    {
        "value": "reyes_coca_cola_bottling",
        "slug": "reyes_coca_cola_bottling",
        "jsonName": "reyes_coca_cola_bottling.json",
        "emptyColumn": false,
        "databaseName": "reyes_coca_cola_bottling"
    },
    {
        "value": "transworld_international_trading",
        "slug": "transworld_international_trading",
        "jsonName": "transworld_international_trading.json",
        "emptyColumn": false,
        "databaseName": "transworld_international_trading"
    },
    {
        "value": "indigenous_foods_llc",
        "slug": "indigenous_foods_llc",
        "jsonName": "indigenous_foods_llc.json",
        "emptyColumn": false,
        "databaseName": "indigenous_foods_llc"
    },
    {
        "value": "spicy_world_old",
        "slug": "spicy_world_old",
        "jsonName": "spicy_world_old.json",
        "emptyColumn": false,
        "databaseName": "spicy_world_old"
    },
    {
        "value": "spicy_world",
        "slug": "spicy_world",
        "jsonName": "spicy_world.json",
        "emptyColumn": false,
        "databaseName": "spicy_world"
    },
    {
        "value": "crestwood farm2",
        "slug": "crestwood-farm2",
        "jsonName": "crestwood-farm2.json",
        "emptyColumn": true,
        "databaseName": "crestwood farm2"
    },
    {
        "value": "Surati",
        "slug": "surati",
        "jsonName": "surati.json",
        "emptyColumn": false,
        "databaseName": "suratis"
    },
    {
        "value": "Temin distribution",
        "slug": "temin-distribution",
        "jsonName": "temin.json",
        "emptyColumn": false,
        "databaseName": "temins"
    },
    {
        "value": "Two brother wholesale",
        "slug": "two-brother-wholesale",
        "jsonName": "two-brother-wholesale.json",
        "emptyColumn": false,
        "databaseName": "twobrotherwholesales"
    },
    {
        "value": "vasinee",
        "slug": "vasinee",
        "jsonName": "vasinee.json",
        "emptyColumn": false,
        "databaseName": "vasinee"
    },
    {
        "value": "Unique importer",
        "slug": "unique-importer",
        "jsonName": "unique-importer.json",
        "emptyColumn": false,
        "databaseName": "uniqueimporters"
    },
    {
        "value": "united_importer",
        "slug": "united_importer",
        "jsonName": "united_importer.json",
        "emptyColumn": false,
        "databaseName": "united_importer"
    },
    {
        "value": "commerce_international",
        "slug": "commerce_international",
        "jsonName": "commerce_international.json",
        "emptyColumn": false,
        "databaseName": "commerce_international"
    },
    {
        "value": "quality food",
        "slug": "quality-food",
        "jsonName": "quality-food.json",
        "emptyColumn": false,
        "databaseName": "quality foods"
    },
    {
        "value": "US gourmet",
        "slug": "us-gourmet-food",
        "jsonName": "us-gourmet-food.json",
        "emptyColumn": false,
        "databaseName": "usgourmetfoods"
    },
    {
        "value": "US gourmet2",
        "slug": "us-gourmet-food2",
        "jsonName": "us-gourmet-food2.json",
        "emptyColumn": false,
        "databaseName": "usgourmetfoods2"
    },
    {
        "value": "usa halal",
        "slug": "usa-halal-foods",
        "jsonName": "usa-halal.json",
        "emptyColumn": false,
        "databaseName": "usa halal"
    },
    {
        "value": "usa halal delight",
        "slug": "usa-halal-foods-delight",
        "jsonName": "usa-halal-food-delight.json",
        "emptyColumn": false,
        "databaseName": "usa halal delight"
    },
    {
        "value": "Vadilal",
        "slug": "vadilal",
        "jsonName": "vadilal.json",
        "emptyColumn": false,
        "databaseName": "vadilals"
    },
    {
        "value": "hes_trade",
        "slug": "hes_trade",
        "jsonName": "hes_trade.json",
        "emptyColumn": false,
        "databaseName": "hes_trade"
    },
    {
        "value": "piece_of_india",
        "slug": "piece_of_india",
        "jsonName": "piece_of_india.json",
        "emptyColumn": true,
        "databaseName": "piece_of_india"
    },
    {
        "value": "vegomart",
        "slug": "vegomart",
        "jsonName": "vegomart.json",
        "emptyColumn": true,
        "databaseName": "vegomart"
    },
    {
        "value": "desi_taste",
        "slug": "desi_taste",
        "jsonName": "desi_taste.json",
        "emptyColumn": false,
        "databaseName": "desi_taste"
    },
    {
        "value": "knp_management",
        "slug": "knp_management",
        "jsonName": "knp_management.json",
        "emptyColumn": false,
        "databaseName": "knp_management"
    },
    {
        "value": "Priya",
        "slug": "priya",
        "jsonName": "priya.json",
        "emptyColumn": false,
        "databaseName": "priya"
    },
    {
        "value": "vdyas",
        "slug": "vdyas",
        "jsonName": "vdyas.json",
        "emptyColumn": false,
        "databaseName": "vdyas"
    },
    {
        "value": "bimbo",
        "slug": "bimbo",
        "jsonName": "bimbo.json",
        "emptyColumn": false,
        "databaseName": "bimbo"
    },
    {
        "value": "bliss tree",
        "slug": "bliss-tree",
        "jsonName": "bliss.json",
        "emptyColumn": false,
        "databaseName": "bliss-tree"
    },
    {
        "value": "rp_and_pb_inc_dba_korea_paper",
        "slug": "rp_and_pb_inc_dba_korea_paper",
        "jsonName": "rp_and_pb_inc_dba_korea_paper.json",
        "emptyColumn": true,
        "databaseName": "rp_and_pb_inc_dba_korea_paper"
    },
    {
        "value": "pepperridge farm",
        "slug": "pepperridge-farm",
        "jsonName": "pepperridge.json",
        "emptyColumn": false,
        "databaseName": "pepperridge"
    },
    {
        "value": "los_olivos_ltd",
        "slug": "los_olivos_ltd",
        "jsonName": "los_olivos_ltd.json",
        "emptyColumn": false,
        "databaseName": "los_olivos_ltd"
    },
    {
        "value": "l_c_citrus_inc",
        "slug": "l_c_citrus_inc",
        "jsonName": "l_c_citrus_inc.json",
        "emptyColumn": false,
        "databaseName": "l_c_citrus_inc"
    },
    {
        "value": "mangal",
        "slug": "mangal",
        "jsonName": "mangal.json",
        "emptyColumn": true,
        "databaseName": "mangal"
    },
    {
        "value": "indika_foods_inc",
        "slug": "indika_foods_inc",
        "jsonName": "indika_foods_inc.json",
        "emptyColumn": false,
        "databaseName": "indika_foods_inc"
    },
    {
        "value": "premium_food_distributors_llc",
        "slug": "premium_food_distributors_llc",
        "jsonName": "premium_food_distributors_llc.json",
        "emptyColumn": false,
        "databaseName": "premium_food_distributors_llc"
    },
    {
        "value": "la_flor_spices",
        "slug": "la_flor_spices",
        "jsonName": "la_flor_spices.json",
        "emptyColumn": false,
        "databaseName": "la_flor_spices"
    },
    {
        "value": "wonder bread",
        "slug": "wonder-bread",
        "jsonName": "wonder.json",
        "emptyColumn": false,
        "databaseName": "wonderbread"
    },
    {
        "value": "Anmol distributors",
        "slug": "anmol-distributors",
        "jsonName": "anmol-distribution.json",
        "emptyColumn": false,
        "databaseName": "anmoldistributions"
    },
    {
        "value": "mansi",
        "slug": "mansi",
        "jsonName": "mansi.json",
        "emptyColumn": false,
        "databaseName": "mansi"
    },
    {
        "value": "bigstock",
        "slug": "bigstock",
        "jsonName": "bigstock.json",
        "emptyColumn": false,
        "databaseName": "bigstock"
    },
    {
        "value": "nazo",
        "slug": "nazo",
        "jsonName": "nazo.json",
        "emptyColumn": false,
        "databaseName": "nazo"
    },
    {
        "value": "jd produce",
        "slug": "jd-produce",
        "jsonName": "jd-produce.json",
        "emptyColumn": false,
        "databaseName": "jd produce"
    },
    {
        "value": "tristar",
        "slug": "tristar",
        "jsonName": "tristar.json",
        "emptyColumn": false,
        "databaseName": "tristar"
    },
    {
        "value": "fyve element",
        "slug": "fyve-element",
        "jsonName": "fyve-element.json",
        "emptyColumn": true,
        "databaseName": "fyve element"
    },
    {
        "value": "armada trade",
        "slug": "armada-trade",
        "jsonName": "armada-trade.json",
        "emptyColumn": false,
        "databaseName": "armada trade"
    },
    {
        "value": "asbk",
        "slug": "asbk",
        "jsonName": "asbk.json",
        "emptyColumn": false,
        "databaseName": "asbk"
    },
    {
        "value": "baawarchi",
        "slug": "baawarchi",
        "jsonName": "baawarchi.json",
        "emptyColumn": false,
        "databaseName": "baawarchi"
    },
    {
        "value": "al & c",
        "slug": "al-&-c",
        "jsonName": "al-&-c.json",
        "emptyColumn": false,
        "databaseName": "al & c"
    },
    {
        "value": "darpan",
        "slug": "darpan",
        "jsonName": "darpan.json",
        "emptyColumn": false,
        "databaseName": "darpan"
    },
    {
        "value": "austinmeat",
        "slug": "austinmeat",
        "jsonName": "austinmeat.json",
        "emptyColumn": false,
        "databaseName": "austinmeat"
    },
    {
        "value": "mayura foods",
        "slug": "mayura-foods",
        "jsonName": "mayura-foods.json",
        "emptyColumn": false,
        "databaseName": "mayura foods"
    },
    {
        "value": "paneling",
        "slug": "paneling",
        "jsonName": "paneling.json",
        "emptyColumn": false,
        "databaseName": "paneling"
    },
    {
        "value": "coral_isle_trading_inc",
        "slug": "coral_isle_trading_inc",
        "jsonName": "coral_isle_trading_inc.json",
        "emptyColumn": false,
        "databaseName": "coral_isle_trading_inc"
    },
    {
        "value": "farmers choice",
        "slug": "farmers-choice",
        "jsonName": "farmers-choice.json",
        "emptyColumn": false,
        "databaseName": "farmerschoice"
    },
    {
        "value": "blue ribbon",
        "slug": "blue-ribbon",
        "jsonName": "blue-ribbon.json",
        "emptyColumn": false,
        "databaseName": "blue ribbon"
    },
    {
        "value": "goya",
        "slug": "goya",
        "jsonName": "goya.json",
        "emptyColumn": false,
        "databaseName": "goya"
    },
    {
        "value": "pure raw honey",
        "slug": "pure-raw-honey",
        "jsonName": "pure-raw-honey.json",
        "emptyColumn": false,
        "databaseName": "pure raw honey"
    },
    {
        "value": "fratt",
        "slug": "fratt",
        "jsonName": "fratt.json",
        "emptyColumn": false,
        "databaseName": "fratt"
    },
    {
        "value": "akshar",
        "slug": "akshar",
        "jsonName": "akshar.json",
        "emptyColumn": false,
        "databaseName": "akshar"
    },
    {
        "value": "gold coast",
        "slug": "gold-coast",
        "jsonName": "gold-coast.json",
        "emptyColumn": false,
        "databaseName": "gold coast"
    },
    {
        "value": "kavya foods",
        "slug": "kavya-foods",
        "jsonName": "kavya-foods.json",
        "emptyColumn": false,
        "databaseName": "kavya-foods"
    },
    {
        "value": "shrinath",
        "slug": "shrinath",
        "jsonName": "shrinath.json",
        "emptyColumn": false,
        "databaseName": "shrinath"
    },
    {
        "value": "mken",
        "slug": "mken",
        "jsonName": "mken.json",
        "emptyColumn": false,
        "databaseName": "mken"
    },
    {
        "value": "sm wholesale",
        "slug": "sm-wholesale",
        "jsonName": "sm-wholesale.json",
        "emptyColumn": false,
        "databaseName": "sm wholesale"
    },
    {
        "value": "amar distribution",
        "slug": "amar-distribution",
        "jsonName": "amar-distribution.json",
        "emptyColumn": false,
        "databaseName": "amar distribution"
    },
    {
        "value": "zoya food",
        "slug": "zoya-food",
        "jsonName": "zoya-food.json",
        "emptyColumn": false,
        "databaseName": "zoya food"
    },
    {
        "value": "agp_&_sons_inc",
        "slug": "agp_&_sons_inc",
        "jsonName": "agp_&_sons_inc.json",
        "emptyColumn": false,
        "databaseName": "agp_&_sons_inc"
    },
    {
        "value": "caribbean_food_specialist",
        "slug": "caribbean_food_specialist",
        "jsonName": "caribbean_food_specialist.json",
        "emptyColumn": false,
        "databaseName": "caribbean_food_specialist"
    },
    {
        "value": "garden_gift",
        "slug": "garden_gift",
        "jsonName": "garden_gift.json",
        "emptyColumn": false,
        "databaseName": "garden_gift"
    },
    {
        "value": "best_cake_distributor",
        "slug": "best_cake_distributor",
        "jsonName": "best_cake_distributor.json",
        "emptyColumn": false,
        "databaseName": "best_cake_distributor"
    },
    {
        "value": "camel_culture",
        "slug": "camel_culture",
        "jsonName": "camel_culture.json",
        "emptyColumn": false,
        "databaseName": "camel_culture"
    },
    {
        "value": "testle",
        "slug": "testle",
        "jsonName": "testle.json",
        "emptyColumn": false,
        "databaseName": "testle"
    },
    {
        "value": "tara",
        "slug": "tara",
        "jsonName": "tara.json",
        "emptyColumn": false,
        "databaseName": "tara"
    },
    {
        "value": "ms_produce_crop",
        "slug": "ms_produce_crop",
        "jsonName": "ms_produce_crop.json",
        "emptyColumn": false,
        "databaseName": "ms_produce_crop"
    },
    {
        "value": "tijarat",
        "slug": "tijarat",
        "jsonName": "tijarat.json",
        "emptyColumn": false,
        "databaseName": "tijarat"
    },
    {
        "value": "thal_golden_spices_inc",
        "slug": "thal_golden_spices_inc",
        "jsonName": "thal_golden_spices_inc.json",
        "emptyColumn": false,
        "databaseName": "thal_golden_spices_inc"
    },
    {
        "value": "plato_market",
        "slug": "plato_market",
        "jsonName": "plato_market.json",
        "emptyColumn": false,
        "databaseName": "plato_market"
    },
    {
        "value": "montes seafood",
        "slug": "montes-seafood",
        "jsonName": "montes-seafood.json",
        "emptyColumn": true,
        "databaseName": "montes seafood"
    },
    {
        "value": "stearling seafood",
        "slug": "stearling-seafood",
        "jsonName": "stearling-seafood.json",
        "emptyColumn": true,
        "databaseName": "stearling seafood"
    },
    {
        "value": "raj global",
        "slug": "raj-global",
        "jsonName": "raj-global.json",
        "emptyColumn": false,
        "databaseName": "raj global"
    },
    {
        "value": "stayci_and_pops_inc",
        "slug": "stayci_and_pops_inc",
        "jsonName": "stayci_and_pops_inc.json",
        "emptyColumn": false,
        "databaseName": "stayci_and_pops_inc"
    },
    {
        "value": "dev_foods",
        "slug": "dev_foods",
        "jsonName": "dev_foods.json",
        "emptyColumn": false,
        "databaseName": "dev_foods"
    },
    {
        "value": "moonee",
        "slug": "moonee",
        "jsonName": "moonee.json",
        "emptyColumn": false,
        "databaseName": "moonee"
    },
    {
        "value": "dsd",
        "slug": "dsd",
        "jsonName": "dsd.json",
        "emptyColumn": false,
        "databaseName": "dsd"
    },
    {
        "value": "apna wholesale",
        "slug": "apna-wholesale",
        "jsonName": "apna-wholesale.json",
        "emptyColumn": false,
        "databaseName": "apna wholesale"
    },
    {
        "value": "swad",
        "slug": "swad",
        "jsonName": "swad.json",
        "emptyColumn": false,
        "databaseName": "swad"
    },
    {
        "value": "Vintage food",
        "slug": "vintage-food",
        "jsonName": "vintage.json",
        "emptyColumn": false,
        "databaseName": "vintages"
    },
    {
        "value": "cinar",
        "slug": "cinar",
        "jsonName": "cinar.json",
        "emptyColumn": true,
        "databaseName": "cinar"
    },
    {
        "value": "miami growers",
        "slug": "miami-growers",
        "jsonName": "miami-growers.json",
        "emptyColumn": true,
        "databaseName": "miami growers"
    },
    {
        "value": "zeefoods",
        "slug": "zeefoods",
        "jsonName": "zeefoods.json",
        "emptyColumn": false,
        "databaseName": "zeefoods"
    },
    {
        "value": "cinar2",
        "slug": "cinar2",
        "jsonName": "cinar2.json",
        "emptyColumn": true,
        "databaseName": "cinar2"
    },
    {
        "value": "jasraj",
        "slug": "jasraj",
        "jsonName": "jasraj.json",
        "emptyColumn": false,
        "databaseName": "jasraj"
    },
    {
        "value": "gharana",
        "slug": "gharana",
        "jsonName": "gharana.json",
        "emptyColumn": false,
        "databaseName": "gharana"
    },
    {
        "value": "ibs-india",
        "slug": "ibs-india",
        "jsonName": "ibs-india.json",
        "emptyColumn": true,
        "databaseName": "ibs-india"
    },
    {
        "value": "kotecha brothers",
        "slug": "kotecha-brothers",
        "jsonName": "kotecha-brothers.json",
        "emptyColumn": false,
        "databaseName": "kotecha brothers"
    },
    {
        "value": "jolin_foods",
        "slug": "jolin_foods",
        "jsonName": "jolin_foods.json",
        "emptyColumn": false,
        "databaseName": "jolin_foods"
    },
    {
        "value": "west_coast_foods_cal_inc",
        "slug": "west_coast_foods_cal_inc",
        "jsonName": "west_coast_foods_cal_inc.json",
        "emptyColumn": false,
        "databaseName": "west_coast_foods_cal_inc"
    },
    {
        "value": "c_&_s_bev_distribution",
        "slug": "c_&_s_bev_distribution",
        "jsonName": "c_&_s_bev_distribution",
        "emptyColumn": false,
        "databaseName": "c_&_s_bev_distribution"
    },
    {
        "value": "liberty_coca_cola_beverages",
        "slug": "liberty_coca_cola_beverages",
        "jsonName": "liberty_coca_cola_beverages.json",
        "emptyColumn": false,
        "databaseName": "liberty_coca_cola_beverages"
    },
    {
        "value": "medo_farms_corp",
        "slug": "medo_farms_corp",
        "jsonName": "medo_farms_corp.json",
        "emptyColumn": true,
        "databaseName": "medo_farms_corp"
    },
    {
        "value": "liberty_orchards",
        "slug": "liberty_orchards",
        "jsonName": "liberty_orchards.json",
        "emptyColumn": true,
        "databaseName": "liberty_orchards"
    },
    {
        "value": "kotecha_brothers_1",
        "slug": "kotecha_brothers_1",
        "jsonName": "kotecha_brothers_1.json",
        "emptyColumn": false,
        "databaseName": "kotecha_brothers_1"
    },
    {
        "value": "wick_and_brothers",
        "slug": "wick_and_brothers",
        "jsonName": "wick_and_brothers.json",
        "emptyColumn": false,
        "databaseName": "wick_and_brothers"
    },
    {
        "value": "tak_distributors",
        "slug": "tak_distributors",
        "jsonName": "tak_distributors.json",
        "emptyColumn": false,
        "databaseName": "tak_distributors"
    },
    {
        "value": "zamzam_produce",
        "slug": "zamzam_produce",
        "jsonName": "zamzam_produce.json",
        "emptyColumn": false,
        "databaseName": "zamzam_produce"
    },
    {
        "value": "coosemans_new_york_inc",
        "slug": "coosemans_new_york_inc",
        "jsonName": "coosemans_new_york_inc.json",
        "emptyColumn": false,
        "databaseName": "coosemans_new_york_inc"
    },
    {
        "value": "tradelinks_web",
        "slug": "tradelinks_web",
        "jsonName": "tradelinks_web.json",
        "emptyColumn": false,
        "databaseName": "tradelinks_web"
    },
    {
        "value": "brunos",
        "slug": "brunos",
        "jsonName": "brunos.json",
        "emptyColumn": false,
        "databaseName": "brunos"
    },
    {
        "value": "surati_sweet_mart",
        "slug": "surati_sweet_mart",
        "jsonName": "surati_sweet_mart.json",
        "emptyColumn": false,
        "databaseName": "surati_sweet_mart"
    },
    {
        "value": "jyena_enterprises",
        "slug": "jyena_enterprises",
        "jsonName": "jyena_enterprises.json",
        "emptyColumn": false,
        "databaseName": "jyena_enterprises"
    },
    {
        "value": "hariohm_traders",
        "slug": "hariohm_traders",
        "jsonName": "hariohm_traders.json",
        "emptyColumn": false,
        "databaseName": "hariohm_traders"
    },
    {
        "value": "Durhan",
        "slug": "Durhan",
        "jsonName": "Durhan.json",
        "emptyColumn": false,
        "databaseName": "Durhan"
    },
    {
        "value": "commerce_international_1",
        "slug": "commerce_international_1",
        "jsonName": "commerce_international_1.json",
        "emptyColumn": false,
        "databaseName": "commerce_international_1"
    },
    {
        "value": "fresh_point",
        "slug": "fresh_point",
        "jsonName": "fresh_point.json",
        "emptyColumn": false,
        "databaseName": "fresh_point"
    },
    {
        "value": "majid_distribution",
        "slug": "majid_distribution",
        "jsonName": "majid_distribution.json",
        "emptyColumn": false,
        "databaseName": "majid_distribution"
    },
    {
        "value": "new_york_wholesale",
        "slug": "new_york_wholesale",
        "jsonName": "new_york_wholesale.json",
        "emptyColumn": false,
        "databaseName": "new_york_wholesale"
    },
    {
        "value": "shivam_distributor",
        "slug": "shivam_distributor",
        "jsonName": "shivam_distributor.json",
        "emptyColumn": false,
        "databaseName": "shivam_distributor"
    },
    {
        "value": "foods_of_india",
        "slug": "foods_of_india",
        "jsonName": "foods_of_india.json",
        "emptyColumn": false,
        "databaseName": "foods_of_india"
    },
    {
        "value": "yara_test",
        "slug": "yara_test",
        "jsonName": "yara_test.json",
        "emptyColumn": false,
        "databaseName": "yara_test"
    },
    {
        "value": "G_n_G",
        "slug": "G_n_G",
        "jsonName": "G_n_G.json",
        "emptyColumn": false,
        "databaseName": "G_n_G"
    },
    {
        "value": "Pioneer_wholesale",
        "slug": "Pioneer_wholesale",
        "jsonName": "Pioneer_wholesale.json",
        "emptyColumn": false,
        "databaseName": "Pioneer_wholesale"
    },
    {
        "value": "Sundarban_halal_meat_fish",
        "slug": "Sundarban_halal_meat_fish",
        "jsonName": "Sundarban_halal_meat_fish.json",
        "emptyColumn": false,
        "databaseName": "Sundarban_halal_meat_fish"
    },
    {
        "value": "new farm",
        "slug": "new-farm",
        "jsonName": "new-farm.json",
        "emptyColumn": false,
        "databaseName": "new farm"
    },
    {
        "value": "polli",
        "slug": "polli",
        "jsonName": "polli.json",
        "emptyColumn": false,
        "databaseName": "polli"
    },
    {
        "value": "tijarat_inc",
        "slug": "tijarat_inc",
        "jsonName": "tijarat_inc.json",
        "emptyColumn": false,
        "databaseName": "tijarat_inc"
    },
    {
        "value": "prestige_concept",
        "slug": "prestige_concept",
        "jsonName": "prestige_concept.json",
        "emptyColumn": false,
        "databaseName": "prestige_concept"
    },
    {
        "value": "pepsi_drink",
        "slug": "pepsi_drink",
        "jsonName": "pepsi_drink.json",
        "emptyColumn": false,
        "databaseName": "pepsi_drink"
    },
    {
        "value": "biscuit",
        "slug": "biscuit",
        "jsonName": "biscuit.json",
        "emptyColumn": false,
        "databaseName": "biscuit"
    },
    {
        "value": "j_&_j_farm",
        "slug": "j_&_j_farm",
        "jsonName": "j_&_j_farm.json",
        "emptyColumn": false,
        "databaseName": "j_&_j_farm"
    },
    {
        "value": "south_asian_food",
        "slug": "south_asian_food",
        "jsonName": "south_asian_food.json",
        "emptyColumn": false,
        "databaseName": "south_asian_food"
    },
    {
        "value": "liberty_beer_depot",
        "slug": "liberty_beer_depot",
        "jsonName": "liberty_beer_depot.json",
        "emptyColumn": false,
        "databaseName": "liberty_beer_depot"
    },
    {
        "value": "imperialdade",
        "slug": "imperialdade",
        "jsonName": "imperialdade.json",
        "emptyColumn": false,
        "databaseName": "imperialdade"
    },
    {
        "value": "Mr_pickle",
        "slug": "Mr_pickle",
        "jsonName": "Mr_pickle.json",
        "emptyColumn": false,
        "databaseName": "Mr_pickle"
    },
    {
        "value": "meat_&_chicken",
        "slug": "meat_&_chicken",
        "jsonName": "meat_&_chicken.json",
        "emptyColumn": false,
        "databaseName": "meat_&_chicken"
    },
    {
        "value": "seeds_&_grains",
        "slug": "seeds_&_grains",
        "jsonName": "seeds_&_grains.json",
        "emptyColumn": false,
        "databaseName": "seeds_&_grains"
    },
    {
        "value": "sd_&_vb",
        "slug": "sd_&_vb",
        "jsonName": "sd_&_vb.json",
        "emptyColumn": false,
        "databaseName": "sd_&_vb"
    },
    {
        "value": "famous_distribution_usa",
        "slug": "famous_distribution_usa",
        "jsonName": "famous_distribution_usa.json",
        "emptyColumn": false,
        "databaseName": "famous_distribution_usa"
    },
    {
        "value": "frito_lay",
        "slug": "frito_lay",
        "jsonName": "frito_lay.json",
        "emptyColumn": false,
        "databaseName": "frito_lay"
    },
    {
        "value": "cintas",
        "slug": "cintas",
        "jsonName": "cintas.json",
        "emptyColumn": false,
        "databaseName": "cintas"
    },
    {
        "value": "ena_meat_packing",
        "slug": "ena_meat_packing",
        "jsonName": "ena_meat_packing.json",
        "emptyColumn": false,
        "databaseName": "ena_meat_packing"
    },
    {
        "value": "ck_frozen_fish_food",
        "slug": "ck_frozen_fish_food",
        "jsonName": "ck_frozen_fish_food.json",
        "emptyColumn": false,
        "databaseName": "ck_frozen_fish_food"
    },
    {
        "value": "meena_foods",
        "slug": "meena_foods",
        "jsonName": "meena_foods.json",
        "emptyColumn": false,
        "databaseName": "meena_foods"
    },
    {
        "value": "senat_poultry",
        "slug": "senat_poultry",
        "jsonName": "senat_poultry.json",
        "emptyColumn": false,
        "databaseName": "senat_poultry"
    },
    {
        "value": "krasdale",
        "slug": "krasdale",
        "jsonName": "krasdale.json",
        "emptyColumn": false,
        "databaseName": "krasdale"
    },
    {
        "value": "hhh_distribution",
        "slug": "hhh_distribution",
        "jsonName": "hhh_distribution.json",
        "emptyColumn": false,
        "databaseName": "hhh_distribution"
    },
    {
        "value": "bengol_food_inc",
        "slug": "bengol_food_inc",
        "jsonName": "bengol_food_inc.json",
        "emptyColumn": false,
        "databaseName": "bengol_food_inc"
    },
    {
        "value": "super_fresh_distribution",
        "slug": "super_fresh_distribution",
        "jsonName": "super_fresh_distribution.json",
        "emptyColumn": false,
        "databaseName": "super_fresh_distribution"
    },
    {
        "value": "hersheys_ice_cream",
        "slug": "hersheys_ice_cream",
        "jsonName": "hersheys_ice_cream.json",
        "emptyColumn": false,
        "databaseName": "hersheys_ice_cream"
    },
    {
        "value": "c_&_g_snacks",
        "slug": "c_&_g_snacks",
        "jsonName": "c_&_g_snacks.json",
        "emptyColumn": false,
        "databaseName": "c_&_g_snacks"
    },
    {
        "value": "darrigo",
        "slug": "darrigo",
        "jsonName": "darrigo.json",
        "emptyColumn": false,
        "databaseName": "darrigo"
    },
    {
        "value": "jalaram_produce",
        "slug": "jalaram_produce",
        "jsonName": "jalaram_produce.json",
        "emptyColumn": false,
        "databaseName": "jalaram_produce"
    },
    {
        "value": "peekay_international",
        "slug": "peekay_international",
        "jsonName": "peekay_international.json",
        "emptyColumn": false,
        "databaseName": "peekay_international"
    },
    {
        "value": "baawarchi_2",
        "slug": "baawarchi_2",
        "jsonName": "baawarchi_2.json",
        "emptyColumn": false,
        "databaseName": "baawarchi_2"
    },
    {
        "value": "bavan",
        "slug": "bavan",
        "jsonName": "bavan.json",
        "emptyColumn": false,
        "databaseName": "bavan"
    },
    {
        "value": "amtrade_2",
        "slug": "amtrade_2",
        "jsonName": "amtrade_2.json",
        "emptyColumn": false,
        "databaseName": "amtrade_2"
    },
    {
        "value": "bk_warehouse",
        "slug": "bk_warehouse",
        "jsonName": "bk_warehouse.json",
        "emptyColumn": false,
        "databaseName": "bk_warehouse"
    },
    {
        "value": "premium_food_usa",
        "slug": "premium_food_usa",
        "jsonName": "premium_food_usa.json",
        "emptyColumn": false,
        "databaseName": "premium_food_usa"
    },
    {
        "value": "euro_food",
        "slug": "euro_food",
        "jsonName": "euro_food.json",
        "emptyColumn": false,
        "databaseName": "euro_food"
    },
    {
        "value": "circus_fruits",
        "slug": "circus_fruits",
        "jsonName": "circus_fruits.json",
        "emptyColumn": false,
        "databaseName": "circus_fruits"
    },
    {
        "value": "doro_foods",
        "slug": "doro_foods",
        "jsonName": "doro_foods.json",
        "emptyColumn": false,
        "databaseName": "doro_foods"
    },
    {
        "value": "fatima_brothers",
        "slug": "fatima_brothers",
        "jsonName": "fatima_brothers.json",
        "emptyColumn": false,
        "databaseName": "fatima_brothers"
    },
    {
        "value": "safi_rice_distributor",
        "slug": "safi_rice_distributor",
        "jsonName": "safi_rice_distributor.json",
        "emptyColumn": false,
        "databaseName": "safi_rice_distributor"
    },
    {
        "value": "natural_food",
        "slug": "natural_food",
        "jsonName": "natural_food.json",
        "emptyColumn": false,
        "databaseName": "natural_food"
    },
    {
        "value": "square_distributor",
        "slug": "square_distributor",
        "jsonName": "square_distributor.json",
        "emptyColumn": false,
        "databaseName": "square_distributor"
    },
    {
        "value": "express_seafood",
        "slug": "express_seafood",
        "jsonName": "express_seafood.json",
        "emptyColumn": false,
        "databaseName": "express_seafood"
    },
    {
        "value": "rubin_brothers",
        "slug": "rubin_brothers",
        "jsonName": "rubin_brothers.json",
        "emptyColumn": false,
        "databaseName": "rubin_brothers"
    },
    {
        "value": "baboo",
        "slug": "baboo",
        "jsonName": "baboo.json",
        "emptyColumn": false,
        "databaseName": "baboo"
    },
    {
        "value": "a_&_j_produce_crop",
        "slug": "a_&_j_produce_crop",
        "jsonName": "a_&_j_produce_crop.json",
        "emptyColumn": false,
        "databaseName": "a_&_j_produce_crop"
    },
    {
        "value": "katzman",
        "slug": "katzman",
        "jsonName": "katzman.json",
        "emptyColumn": false,
        "databaseName": "katzman"
    },
    {
        "value": "hhh_distribution_1",
        "slug": "hhh_distribution_1",
        "jsonName": "hhh_distribution_1.json",
        "emptyColumn": false,
        "databaseName": "hhh_distribution_1"
    },
    {
        "value": "kbf_inc",
        "slug": "kbf_inc",
        "jsonName": "kbf_inc.json",
        "emptyColumn": false,
        "databaseName": "kbf_inc"
    },
    {
        "value": "blue_water_usa",
        "slug": "blue_water_usa",
        "jsonName": "blue_water_usa.json",
        "emptyColumn": false,
        "databaseName": "blue_water_usa"
    },
    {
        "value": "deshi_distributor",
        "slug": "deshi_distributor",
        "jsonName": "deshi_distributor.json",
        "emptyColumn": false,
        "databaseName": "deshi_distributor"
    },
    {
        "value": "blue_sea_products",
        "slug": "blue_sea_products",
        "jsonName": "blue_sea_products.json",
        "emptyColumn": false,
        "databaseName": "blue_sea_products"
    },
    {
        "value": "new_hoque_sons",
        "slug": "new_hoque_sons",
        "jsonName": "new_hoque_sons.json",
        "emptyColumn": false,
        "databaseName": "new_hoque_sons"
    },
    {
        "value": "elabuelito_cheese_inc",
        "slug": "elabuelito_cheese_inc",
        "jsonName": "elabuelito_cheese_inc.json",
        "emptyColumn": false,
        "databaseName": "elabuelito_cheese_inc"
    },
    {
        "value": "al_aqsa_halal_meat",
        "slug": "al_aqsa_halal_meat",
        "jsonName": "al_aqsa_halal_meat.json",
        "emptyColumn": false,
        "databaseName": "al_aqsa_halal_meat"
    },
    {
        "value": "hitmark_republic",
        "slug": "hitmark_republic",
        "jsonName": "hitmark_republic.json",
        "emptyColumn": false,
        "databaseName": "hitmark_republic"
    },
    {
        "value": "shine_impex_inc",
        "slug": "shine_impex_inc",
        "jsonName": "shine_impex_inc.json",
        "emptyColumn": true,
        "databaseName": "shine_impex_inc"
    },
    {
        "value": "tastle_usa",
        "slug": "tastle_usa",
        "jsonName": "tastle_usa.json",
        "emptyColumn": false,
        "databaseName": "tastle_usa"
    },
    {
        "value": "east_asia_food_trading",
        "slug": "east_asia_food_trading",
        "jsonName": "east_asia_food_trading.json",
        "emptyColumn": false,
        "databaseName": "east_asia_food_trading"
    },
    {
        "value": "spicy_sense",
        "slug": "spicy_sense",
        "jsonName": "spicy_sense.json",
        "emptyColumn": false,
        "databaseName": "spicy_sense"
    },
    {
        "value": "khaled_hamad_dates",
        "slug": "khaled_hamad_dates",
        "jsonName": "khaled_hamad_dates.json",
        "emptyColumn": false,
        "databaseName": "khaled_hamad_dates"
    },
    {
        "value": "desi_meat_freshno",
        "slug": "desi_meat_freshno",
        "jsonName": "desi_meat_freshno.json",
        "emptyColumn": false,
        "databaseName": "desi_meat_freshno"
    },
    {
        "value": "Weisman_Distribution",
        "slug": "Weisman_Distribution",
        "jsonName": "Weisman_Distribution.json",
        "emptyColumn": false,
        "databaseName": "Weisman_Distribution"
    },
    {
        "value": "Slaughter house",
        "slug": "slaughter-house",
        "jsonName": "slaughter-house.json",
        "emptyColumn": false,
        "databaseName": "slaughterhouses"
    },
    {
        "value": "Vintage food2",
        "slug": "vintage-food2",
        "jsonName": "vintage-food2.json",
        "emptyColumn": true,
        "databaseName": "vintage food2"
    },
    {
        "value": "lala_produce_inc",
        "slug": "lala_produce_inc",
        "jsonName": "lala_produce_inc.json",
        "emptyColumn": false,
        "databaseName": "lala_produce_inc"
    },
    {
        "value": "reddy_raw",
        "slug": "reddy_raw",
        "jsonName": "reddy_raw",
        "emptyColumn": false,
        "databaseName": "reddy_raw"
    },
    {
        "value": "anmol",
        "slug": "anmol",
        "jsonName": "anmol",
        "emptyColumn": false,
        "databaseName": "anmol"
    },
    {
        "value": "dave_west_indian_product",
        "slug": "dave_west_indian_product",
        "jsonName": "dave_west_indian_product.json",
        "emptyColumn": false,
        "databaseName": "dave_west_indian_product"
    },
    {
        "value": "porky",
        "slug": "porky",
        "jsonName": "porky",
        "emptyColumn": false,
        "databaseName": "porky"
    },
    {
        "value": "dreamline_foods",
        "slug": "dreamline_foods",
        "jsonName": "dreamline_foods",
        "emptyColumn": false,
        "databaseName": "dreamline_foods"
    },
    {
        "value": "satya_sweets",
        "slug": "satya_sweets",
        "jsonName": "satya_sweets.json",
        "emptyColumn": false,
        "databaseName": "satya_sweets"
    },
    {
        "value": "cream_o_land_2",
        "slug": "cream_o_land_2",
        "jsonName": "cream_o_land_2.json",
        "emptyColumn": true,
        "databaseName": "cream_o_land_2"
    },
    {
        "value": "west_tag_inc",
        "slug": "west_tag_inc",
        "jsonName": "west_tag_inc.json",
        "emptyColumn": true,
        "databaseName": "west_tag_inc"
    },
    {
        "value": "pratap_traders",
        "slug": "pratap_traders",
        "jsonName": "pratap_traders.json",
        "emptyColumn": false,
        "databaseName": "pratap_traders"
    },
    {
        "value": "AZ Metro Distribution",
        "slug": "az-metro-distribution",
        "jsonName": "az-metro-distribution.json",
        "emptyColumn": false,
        "databaseName": "azmetrodistribution"
    },
    {
        "value": "shahjalal_distribution",
        "slug": "shahjalal_distribution",
        "jsonName": "shahjalal_distribution.json",
        "emptyColumn": false,
        "databaseName": "shahjalal_distribution"
    },
    {
        "value": "kotecha_brothers_2",
        "slug": "kotecha_brothers_2",
        "jsonName": "kotecha_brothers_2.json",
        "emptyColumn": false,
        "databaseName": "kotecha_brothers_2"
    },
    {
        "value": "pina_food_llc",
        "slug": "pina_food_llc",
        "jsonName": "pina_food_llc.json",
        "emptyColumn": false,
        "databaseName": "pina_food_llc"
    },
    {
        "value": "native_food_llc",
        "slug": "native_food_llc",
        "jsonName": "native_food_llc.json",
        "emptyColumn": false,
        "databaseName": "native_food_llc"
    },
    {
        "value": "king_foods_&_vegetables",
        "slug": "king_foods_&_vegetables",
        "jsonName": "king_foods_&_vegetables.json",
        "emptyColumn": false,
        "databaseName": "king_foods_&_vegetables"
    },
    {
        "value": "anshu_foods_2",
        "slug": "anshu_foods_2",
        "jsonName": "anshu_foods_2.json",
        "emptyColumn": true,
        "databaseName": "anshu_foods_2"
    },
    {
        "value": "bakery_espiga",
        "slug": "bakery_espiga",
        "jsonName": "bakery_espiga.json",
        "emptyColumn": false,
        "databaseName": "bakery_espiga"
    },
    {
        "value": "l_&_m_dairy",
        "slug": "l_&_m_dairy",
        "jsonName": "l_&_m_dairy.json",
        "emptyColumn": false,
        "databaseName": "l_&_m_dairy"
    },
    {
        "value": "delight_big_bazzar_rana",
        "slug": "delight_big_bazzar_rana",
        "jsonName": "delight_big_bazzar_rana.json",
        "emptyColumn": true,
        "databaseName": "delight_big_bazzar_rana"
    },
    {
        "value": "tri_state_foods_distribution",
        "slug": "tri_state_foods_distribution",
        "jsonName": "tri_state_foods_distribution.json",
        "emptyColumn": false,
        "databaseName": "tri_state_foods_distribution"
    },
    {
        "value": "mysha_distributors_llc_2",
        "slug": "mysha_distributors_llc_2",
        "jsonName": "mysha_distributors_llc_2.json",
        "emptyColumn": false,
        "databaseName": "mysha_distributors_llc_2"
    },
    {
        "value": "chefler_foods",
        "slug": "chefler_foods",
        "jsonName": "chefler_foods.json",
        "emptyColumn": false,
        "databaseName": "chefler_foods"
    },
    {
        "value": "bulk_buy_nj_llc",
        "slug": "bulk_buy_nj_llc",
        "jsonName": "bulk_buy_nj_llc.json",
        "emptyColumn": false,
        "databaseName": "bulk_buy_nj_llc"
    },
    {
        "value": "nanki",
        "slug": "nanki",
        "jsonName": "nanki.json",
        "emptyColumn": true,
        "databaseName": "nanki"
    },
    {
        "value": "maharaja_food_importers_2",
        "slug": "maharaja_food_importers_2",
        "jsonName": "maharaja_food_importers_2.json",
        "emptyColumn": false,
        "databaseName": "maharaja_food_importers_2"
    },
    {
        "value": "american_bazar_llc",
        "slug": "american_bazar_llc",
        "jsonName": "american_bazar_llc.json",
        "emptyColumn": true,
        "databaseName": "american_bazar_llc"
    },
    {
        "value": "NY zara food",
        "slug": "ny-zara-food",
        "jsonName": "ny-zara-food-inc.json",
        "emptyColumn": false,
        "databaseName": "nyzarafoodincs"
    },
    {
        "value": "t_m_kovacevich_pjiladelphia",
        "slug": "t_m_kovacevich_pjiladelphia",
        "jsonName": "t_m_kovacevich_pjiladelphia.json",
        "emptyColumn": false,
        "databaseName": "t_m_kovacevich_pjiladelphia"
    },
    {
        "value": "karoun_dairies",
        "slug": "karoun_dairies",
        "jsonName": "karoun_dairies.json",
        "emptyColumn": false,
        "databaseName": "karoun_dairies"
    },
    {
        "value": "g_&_g",
        "slug": "g_&_g",
        "jsonName": "g_&_g.json",
        "emptyColumn": false,
        "databaseName": "g_&_g"
    },
    {
        "value": "bucs_inc",
        "slug": "bucs_inc",
        "jsonName": "bucs_inc.json",
        "emptyColumn": false,
        "databaseName": "bucs_inc"
    },
    {
        "value": "gitto_&_sons_health_food",
        "slug": "gitto_&_sons_health_food",
        "jsonName": "gitto_&_sons_health_food.json",
        "emptyColumn": false,
        "databaseName": "gitto_&_sons_health_food"
    },
    {
        "value": "best_cash_and_carry",
        "slug": "best_cash_and_carry",
        "jsonName": "best_cash_and_carry.json",
        "emptyColumn": false,
        "databaseName": "best_cash_and_carry"
    },
    {
        "value": "Los Olivos Ltd",
        "slug": "los-olivos-ltd",
        "jsonName": "los-olivos-ltd.json",
        "emptyColumn": false,
        "databaseName": "losolivosltd"
    },
    {
        "value": "premium_supermarket_jamaica",
        "slug": "premium_supermarket_jamaica",
        "jsonName": "premium_supermarket_jamaica.json",
        "emptyColumn": true,
        "databaseName": "premium_supermarket_jamaica"
    },
    {
        "value": "ethnic_food_babu_bhai",
        "slug": "ethnic_food_babu_bhai",
        "jsonName": "ethnic_food_babu_bhai.json",
        "emptyColumn": true,
        "databaseName": "ethnic_food_babu_bhai"
    },
    {
        "value": "caribbean_depot",
        "slug": "caribbean_depot",
        "jsonName": "caribbean_depot.json",
        "emptyColumn": false,
        "databaseName": "caribbean_depot"
    },
    {
        "value": "global_import_&_export_corp",
        "slug": "global_import_&_export_corp",
        "jsonName": "global_import_&_export_corp.json",
        "emptyColumn": false,
        "databaseName": "global_import_&_export_corp"
    },
    {
        "value": "galil_2",
        "slug": "galil_2",
        "jsonName": "galil_2.json",
        "emptyColumn": false,
        "databaseName": "galil_2"
    },
    {
        "value": "kotecha_brothers_3",
        "slug": "kotecha_brothers_3",
        "jsonName": "kotecha_brothers_3.json",
        "emptyColumn": false,
        "databaseName": "kotecha_brothers_3"
    },
    {
        "value": "jersey_dairy_express",
        "slug": "jersey_dairy_express",
        "jsonName": "jersey_dairy_express.json",
        "emptyColumn": false,
        "databaseName": "jersey_dairy_express"
    },
    {
        "value": "vijay",
        "slug": "vijay",
        "jsonName": "vijay",
        "emptyColumn": false,
        "databaseName": "vijay"
    },
    {
        "value": "fresco",
        "slug": "fresco",
        "jsonName": "fresco.json",
        "emptyColumn": false,
        "databaseName": "fresco"
    },
    {
        "value": "plastic_plus_llc",
        "slug": "plastic_plus_llc",
        "jsonName": "plastic_plus_llc.json",
        "emptyColumn": false,
        "databaseName": "plastic_plus_llc"
    },
    {
        "value": "sanskriti_usa_inc",
        "slug": "sanskriti_usa_inc",
        "jsonName": "sanskriti_usa_inc.json",
        "emptyColumn": false,
        "databaseName": "sanskriti_usa_inc"
    },
    {
        "value": "tasty_fresh",
        "slug": "tasty_fresh",
        "jsonName": "tasty_fresh.json",
        "emptyColumn": true,
        "databaseName": "tasty_fresh"
    },
    {
        "value": "solarte_foods",
        "slug": "solarte_foods",
        "jsonName": "solarte_foods.json",
        "emptyColumn": false,
        "databaseName": "solarte_foods"
    },
    {
        "value": "spice_n_more_corp",
        "slug": "spice_n_more_corp",
        "jsonName": "spice_n_more_corp.json",
        "emptyColumn": false,
        "databaseName": "spice_n_more_corp"
    },
    {
        "value": "hal&al_food",
        "slug": "hal&al_food",
        "jsonName": "hal&al_food.json",
        "emptyColumn": false,
        "databaseName": "hal&al_food"
    },
    {
        "value": "abarrotes_del_sur_llc",
        "slug": "abarrotes_del_sur_llc",
        "jsonName": "abarrotes_del_sur_llc.json",
        "emptyColumn": false,
        "databaseName": "abarrotes_del_sur_llc"
    },
    {
        "value": "kcb",
        "slug": "kcb",
        "jsonName": "kcb.json",
        "emptyColumn": false,
        "databaseName": "kcb"
    },
    {
        "value": "world_foods_inc",
        "slug": "world_foods_inc",
        "jsonName": "world_foods_inc.json",
        "emptyColumn": false,
        "databaseName": "world_foods_inc"
    },
    {
        "value": "sm_wholesale",
        "slug": "sm_wholesale",
        "jsonName": "sm_wholesale.json",
        "emptyColumn": false,
        "databaseName": "sm_wholesale"
    },
    {
        "value": "dhanya_foods_llc",
        "slug": "dhanya_foods_llc",
        "jsonName": "dhanya_foods_llc.json",
        "emptyColumn": false,
        "databaseName": "dhanya_foods_llc"
    },
    {
        "value": "total_produce_usa_llc",
        "slug": "total_produce_usa_llc",
        "jsonName": "total_produce_usa_llc.json",
        "emptyColumn": false,
        "databaseName": "total_produce_usa_llc"
    },
    {
        "value": "palo_alto_foods",
        "slug": "palo_alto_foods",
        "jsonName": "palo_alto_foods.json",
        "emptyColumn": true,
        "databaseName": "palo_alto_foods"
    },
    {
        "value": "boncha_international_inc",
        "slug": "boncha_international_inc",
        "jsonName": "boncha_international_inc.json",
        "emptyColumn": false,
        "databaseName": "boncha_international_inc"
    },
    {
        "value": "yem_foods_llc",
        "slug": "yem_foods_llc",
        "jsonName": "yem_foods_llc.json",
        "emptyColumn": false,
        "databaseName": "yem_foods_llc"
    },
    {
        "value": "gold_medal_produce",
        "slug": "gold_medal_produce",
        "jsonName": "gold_medal_produce.json",
        "emptyColumn": false,
        "databaseName": "gold_medal_produce"
    },
    {
        "value": "santos",
        "slug": "santos",
        "jsonName": "santos.json",
        "emptyColumn": false,
        "databaseName": "santos"
    },
    {
        "value": "metro_basics_usa_inc",
        "slug": "metro_basics_usa_inc",
        "jsonName": "metro_basics_usa_inc.json",
        "emptyColumn": false,
        "databaseName": "metro_basics_usa_inc"
    },
    {
        "value": "bondsforever_inc",
        "slug": "bondsforever_inc",
        "jsonName": "bondsforever_inc.json",
        "emptyColumn": false,
        "databaseName": "bondsforever_inc"
    },
    {
        "value": "dhanraj",
        "slug": "dhanraj",
        "jsonName": "dhanraj.json",
        "emptyColumn": false,
        "databaseName": "dhanraj"
    },
    {
        "value": "piece_of_india_2",
        "slug": "piece_of_india_2",
        "jsonName": "piece_of_india_2.json",
        "emptyColumn": false,
        "databaseName": "piece_of_india_2"
    },
    {
        "value": "roshni_food_2",
        "slug": "roshni_food_2",
        "jsonName": "roshni_food_2.json",
        "emptyColumn": true,
        "databaseName": "roshni_food_2"
    },
    {
        "value": "mansi_distribution",
        "slug": "mansi_distribution",
        "jsonName": "mansi_distribution.json",
        "emptyColumn": false,
        "databaseName": "mansi_distribution"
    },
    {
        "value": "poran_agro_products_ltd",
        "slug": "poran_agro_products_ltd",
        "jsonName": "poran_agro_products_ltd.json",
        "emptyColumn": true,
        "databaseName": "poran_agro_products_ltd"
    },
    {
        "value": "uniware_2",
        "slug": "uniware_2",
        "jsonName": "uniware_2.json",
        "emptyColumn": false,
        "databaseName": "uniware_2"
    },
    {
        "value": "ajmi_foods_usa_llc",
        "slug": "ajmi_foods_usa_llc",
        "jsonName": "ajmi_foods_usa_llc.json",
        "emptyColumn": false,
        "databaseName": "ajmi_foods_usa_llc"
    },
    {
        "value": "lee_loi",
        "slug": "lee_loi",
        "jsonName": "lee_loi.json",
        "emptyColumn": false,
        "databaseName": "lee_loi"
    },
    {
        "value": "the_breaven_llc",
        "slug": "the_breaven_llc",
        "jsonName": "the_breaven_llc.json",
        "emptyColumn": true,
        "databaseName": "the_breaven_llc"
    },
    {
        "value": "pitco_foods",
        "slug": "pitco_foods",
        "jsonName": "pitco_foods.json",
        "emptyColumn": false,
        "databaseName": "pitco_foods"
    },
    {
        "value": "p_east_trading_corp",
        "slug": "p_east_trading_corp",
        "jsonName": "p_east_trading_corp.json",
        "emptyColumn": false,
        "databaseName": "p_east_trading_corp"
    },
    {
        "value": "habp_global",
        "slug": "habp_global",
        "jsonName": "habp_global.json",
        "emptyColumn": false,
        "databaseName": "habp_global"
    },
    {
        "value": "t_squared_produce_guardians",
        "slug": "t_squared_produce_guardians",
        "jsonName": "t_squared_produce_guardians.json",
        "emptyColumn": true,
        "databaseName": "t_squared_produce_guardians"
    },
    {
        "value": "nyc_tropical_house_inc",
        "slug": "nyc_tropical_house_inc",
        "jsonName": "nyc_tropical_house_inc.json",
        "emptyColumn": false,
        "databaseName": "nyc_tropical_house_inc"
    },
    {
        "value": "central_valley_impex",
        "slug": "central_valley_impex",
        "jsonName": "central_valley_impex.json",
        "emptyColumn": true,
        "databaseName": "central_valley_impex"
    },
    {
        "value": "venzu_traders_llc",
        "slug": "venzu_traders_llc",
        "jsonName": "venzu_traders_llc.json",
        "emptyColumn": false,
        "databaseName": "venzu_traders_llc"
    },
    {
        "value": "salmo_corporation",
        "slug": "salmo_corporation",
        "jsonName": "salmo_corporation.json",
        "emptyColumn": false,
        "databaseName": "salmo_corporation"
    },
    {
        "value": "sajni_tradlink",
        "slug": "sajni_tradlink",
        "jsonName": "sajni_tradlink.json",
        "emptyColumn": true,
        "databaseName": "sajni_tradlink"
    },
    {
        "value": "kf_plus_distribution",
        "slug": "kf_plus_distribution",
        "jsonName": "kf_plus_distribution.json",
        "emptyColumn": false,
        "databaseName": "kf_plus_distribution"
    },
    {
        "value": "united_food_brands_llc",
        "slug": "united_food_brands_llc",
        "jsonName": "united_food_brands_llc.json",
        "emptyColumn": false,
        "databaseName": "united_food_brands_llc"
    },
    {
        "value": "coutros_brothers_inc",
        "slug": "coutros_brothers_inc",
        "jsonName": "coutros_brothers_inc.json",
        "emptyColumn": false,
        "databaseName": "coutros_brothers_inc"
    },
    {
        "value": "rotiwala_llc",
        "slug": "rotiwala_llc",
        "jsonName": "rotiwala_llc.json",
        "emptyColumn": false,
        "databaseName": "rotiwala_llc"
    },
    {
        "value": "kool_temp_foods",
        "slug": "kool_temp_foods",
        "jsonName": "kool_temp_foods.json",
        "emptyColumn": false,
        "databaseName": "kool_temp_foods"
    },
    {
        "value": "best_tropical_island_inc",
        "slug": "best_tropical_island_inc",
        "jsonName": "best_tropical_island_inc.json",
        "emptyColumn": false,
        "databaseName": "best_tropical_island_inc"
    },
    {
        "value": "bhanu_impex_llc",
        "slug": "bhanu_impex_llc",
        "jsonName": "bhanu_impex_llc.json",
        "emptyColumn": false,
        "databaseName": "bhanu_impex_llc"
    },
    {
        "value": "royal_fresh",
        "slug": "royal_fresh",
        "jsonName": "royal_fresh.json",
        "emptyColumn": false,
        "databaseName": "royal_fresh"
    },
    {
        "value": "super_bread",
        "slug": "super_bread",
        "jsonName": "super_bread.json",
        "emptyColumn": false,
        "databaseName": "super_bread"
    },
    {
        "value": "isra_snacks",
        "slug": "isra_snacks",
        "jsonName": "isra_snacks.json",
        "emptyColumn": false,
        "databaseName": "isra_snacks"
    },
    {
        "value": "vali_produce_llc",
        "slug": "vali_produce_llc",
        "jsonName": "vali_produce_llc.json",
        "emptyColumn": true,
        "databaseName": "vali_produce_llc"
    },
    {
        "value": "american_spices_llc",
        "slug": "american_spices_llc",
        "jsonName": "american_spices_llc.json",
        "emptyColumn": false,
        "databaseName": "american_spices_llc"
    },
    {
        "value": "cnb",
        "slug": "cnb",
        "jsonName": "cnb.json",
        "emptyColumn": false,
        "databaseName": "cnb"
    },
    {
        "value": "tas_foods_corp",
        "slug": "tas_foods_corp",
        "jsonName": "tas_foods_corp.json",
        "emptyColumn": false,
        "databaseName": "tas_foods_corp"
    },
    {
        "value": "agm_wholesale",
        "slug": "agm_wholesale",
        "jsonName": "agm_wholesale.json",
        "emptyColumn": false,
        "databaseName": "agm_wholesale"
    },
    {
        "value": "bliss_tree",
        "slug": "bliss_tree",
        "jsonName": "bliss_tree.json",
        "emptyColumn": true,
        "databaseName": "bliss_tree"
    },
    {
        "value": "general_trading",
        "slug": "general_trading",
        "jsonName": "general_trading.json",
        "emptyColumn": false,
        "databaseName": "general_trading"
    },
    {
        "value": "finest_food_distributing_co",
        "slug": "finest_food_distributing_co",
        "jsonName": "finest_food_distributing_co.json",
        "emptyColumn": false,
        "databaseName": "finest_food_distributing_co"
    },
    {
        "value": "my_sales_ny",
        "slug": "my_sales_ny",
        "jsonName": "my_sales_ny.json",
        "emptyColumn": true,
        "databaseName": "my_sales_ny"
    },
    {
        "value": "dannon",
        "slug": "dannon",
        "jsonName": "dannon.json",
        "emptyColumn": false,
        "databaseName": "dannon"
    },
    {
        "value": "Aahubarah USA",
        "slug": "aahubarah-usa",
        "jsonName": "aahubarah.json",
        "emptyColumn": false,
        "databaseName": "aahubarahs"
    },
    {
        "value": "surati_new",
        "slug": "surati_new",
        "jsonName": "surati_new.json",
        "emptyColumn": false,
        "databaseName": "surati_new"
    },
    {
        "value": "Katzman Berry Corp",
        "slug": "katzman-beery-corp",
        "jsonName": "katzman-berry-corp.json",
        "emptyColumn": true,
        "databaseName": "katzmanberrycorp"
    },
    {
        "value": "pjl_route",
        "slug": "pjl_route",
        "jsonName": "pjl_route",
        "emptyColumn": true,
        "databaseName": "pjl_route"
    },
    {
        "value": "Delight foods",
        "slug": "delight-food",
        "jsonName": "delight-foods.json",
        "emptyColumn": true,
        "databaseName": "delightfoods"
    },
    {
        "value": "Goyal group",
        "slug": "goyal-group",
        "jsonName": "goyal-grp.json",
        "emptyColumn": false,
        "databaseName": "goyalgrps"
    },
    {
        "value": "Duty Free Produce",
        "slug": "duty-free-produce",
        "jsonName": "duty-free-produce.json",
        "emptyColumn": false,
        "databaseName": "dutyfreeproduces"
    },
    {
        "value": "Krishna Food Corp",
        "slug": "krishna-food-corp",
        "jsonName": "krishna-food-corp.json",
        "emptyColumn": true,
        "databaseName": "krishnafoodcorp"
    },
    {
        "value": "rajbhog_2",
        "slug": "rajbhog_2",
        "jsonName": "rajbhog_2.json",
        "emptyColumn": true,
        "databaseName": "rajbhog_2"
    },
    {
        "value": "apna_wholesale",
        "slug": "apna_wholesale",
        "jsonName": "apna_wholesale.json",
        "emptyColumn": false,
        "databaseName": "apna_wholesale"
    },
    {
        "value": "Mels ice-cream",
        "slug": "mels-ice-cream",
        "jsonName": "mel-icecream.json",
        "emptyColumn": false,
        "databaseName": "melicecreams"
    },
    {
        "value": "New reliance traders",
        "slug": "new-reliance-traders",
        "jsonName": "new-reliance.json",
        "emptyColumn": false,
        "databaseName": "newreliances"
    },
    {
        "value": "c_j_natural",
        "slug": "c_j_natural",
        "jsonName": "c_j_natural.json",
        "emptyColumn": true,
        "databaseName": "c_j_natural"
    },
    {
        "value": "primo_brands",
        "slug": "primo_brands",
        "jsonName": "primo_brands.json",
        "emptyColumn": false,
        "databaseName": "primo_brands"
    },
    {
        "value": "Nirav Indian groceries",
        "slug": "nirav-indian-groceries",
        "jsonName": "nirav-indian-groceries.json",
        "emptyColumn": false,
        "databaseName": "niravindiangroceries"
    },
    {
        "value": "c_n_b_choe_natural_brands_llc",
        "slug": "c_n_b_choe_natural_brands_llc",
        "jsonName": "c_n_b_choe_natural_brands_llc.json",
        "emptyColumn": false,
        "databaseName": "c_n_b_choe_natural_brands_llc"
    },
    {
        "value": "liberty_villagers_corp",
        "slug": "liberty_villagers_corp",
        "jsonName": "liberty_villagers_corp.json",
        "emptyColumn": false,
        "databaseName": "liberty_villagers_corp"
    },
    {
        "value": "the_everest_bakery",
        "slug": "the_everest_bakery",
        "jsonName": "the_everest_bakery.json",
        "emptyColumn": true,
        "databaseName": "the_everest_bakery"
    },
    {
        "value": "american_pure_honey",
        "slug": "american_pure_honey",
        "jsonName": "american_pure_honey.json",
        "emptyColumn": false,
        "databaseName": "american_pure_honey"
    },
    {
        "value": "e_and_p_beverage",
        "slug": "e_and_p_beverage",
        "jsonName": "e_and_p_beverage.json",
        "emptyColumn": false,
        "databaseName": "e_and_p_beverage"
    },
    {
        "value": "Spicy sense",
        "slug": "spicy-sense",
        "jsonName": "spicy-sense.json",
        "emptyColumn": false,
        "databaseName": "spicysenses"
    },
    {
        "value": "Spicy world",
        "slug": "spicy-world",
        "jsonName": "spicy-world.json",
        "emptyColumn": false,
        "databaseName": "spicyworlds"
    },
    {
        "value": "usa halal food",
        "slug": "usa-halal-foods",
        "jsonName": "usa-halal-food.json",
        "emptyColumn": false,
        "databaseName": "usa halal food"
    },
    {
        "value": "crestwood",
        "slug": "crestwood",
        "jsonName": "crestwood.json",
        "emptyColumn": false,
        "databaseName": "crestwood"
    },
    {
        "value": "tara family",
        "slug": "tara-family",
        "jsonName": "tara.json",
        "emptyColumn": false,
        "databaseName": "tarafamily"
    },
    {
        "value": "tru pac",
        "slug": "tru-pac",
        "jsonName": "tru-pac.json",
        "emptyColumn": false,
        "databaseName": "trupac"
    },
    {
        "value": "delight_big_bazar",
        "slug": "delight_big_bazar",
        "jsonName": "delight_big_bazar.json",
        "emptyColumn": false,
        "databaseName": "delight_big_bazar"
    },
    {
        "value": "lt food",
        "slug": "lt-food",
        "jsonName": "lt-food.json",
        "emptyColumn": false,
        "databaseName": "lt food"
    },
    {
        "value": "uniware",
        "slug": "uniware",
        "jsonName": "uniware.json",
        "emptyColumn": false,
        "databaseName": "uniware"
    },
    {
        "value": "desi",
        "slug": "desi",
        "jsonName": "desi.json",
        "emptyColumn": false,
        "databaseName": "desi"
    },
    {
        "value": "tigarat",
        "slug": "tigarat",
        "jsonName": "tigarat.json",
        "emptyColumn": false,
        "databaseName": "tigarat"
    },
    {
        "value": "baba",
        "slug": "baba",
        "jsonName": "baba.json",
        "emptyColumn": false,
        "databaseName": "baba"
    },
    {
        "value": "utopia",
        "slug": "utopia",
        "jsonName": "utopia.json",
        "emptyColumn": false,
        "databaseName": "utopia"
    },
    {
        "value": "george",
        "slug": "george",
        "jsonName": "george.json",
        "emptyColumn": false,
        "databaseName": "george"
    },
    {
        "value": "george2",
        "slug": "george2",
        "jsonName": "george2.json",
        "emptyColumn": false,
        "databaseName": "george2"
    },
    {
        "value": "stuti food distributor",
        "slug": "stuti-food-distributor",
        "jsonName": "stuti-food-distributor.json",
        "emptyColumn": false,
        "databaseName": "stuti food distributor"
    },
    {
        "value": "kadakia",
        "slug": "kadakia",
        "jsonName": "kadakia.json",
        "emptyColumn": false,
        "databaseName": "kadakia"
    },
    {
        "value": "kissena",
        "slug": "kissena",
        "jsonName": "kissena.json",
        "emptyColumn": false,
        "databaseName": "kissena"
    },
    {
        "value": "kwality",
        "slug": "kwality",
        "jsonName": "kwality.json",
        "emptyColumn": true,
        "databaseName": "kwality"
    },
    {
        "value": "noble",
        "slug": "noble",
        "jsonName": "noble.json",
        "emptyColumn": false,
        "databaseName": "noble"
    },
    {
        "value": "pari food",
        "slug": "pari-food",
        "jsonName": "pari-food.json",
        "emptyColumn": false,
        "databaseName": "pari food"
    },
    {
        "value": "roshni foods",
        "slug": "roshni-foods",
        "jsonName": "roshni-foods.json",
        "emptyColumn": false,
        "databaseName": "roshni-foods"
    },
    {
        "value": "samossa bites",
        "slug": "samossa-bites",
        "jsonName": "samossa-bites.json",
        "emptyColumn": false,
        "databaseName": "samossa bites"
    },
    {
        "value": "all_cleaners_and_more",
        "slug": "all_cleaners_and_more",
        "jsonName": "all_cleaners_and_more.json",
        "emptyColumn": false,
        "databaseName": "all_cleaners_and_more"
    },
    {
        "value": "american_brands_and_more",
        "slug": "american_brands_and_more",
        "jsonName": "american_brands_and_more.json",
        "emptyColumn": false,
        "databaseName": "american_brands_and_more"
    },
    {
        "value": "gms_distributors",
        "slug": "gms_distributors",
        "jsonName": "gms_distributors.json",
        "emptyColumn": false,
        "databaseName": "gms_distributors"
    },
    {
        "value": "ansu_foods",
        "slug": "ansu_foods",
        "jsonName": "ansu_foods.json",
        "emptyColumn": true,
        "databaseName": "ansu_foods"
    },
    {
        "value": "superpak",
        "slug": "superpak",
        "jsonName": "superpak.json",
        "emptyColumn": false,
        "databaseName": "superpak"
    },
    {
        "value": "rps_distributors_inc",
        "slug": "rps_distributors_inc",
        "jsonName": "rps_distributors_inc.json",
        "emptyColumn": false,
        "databaseName": "rps_distributors_inc"
    },
    {
        "value": "gurudev_imports_inc",
        "slug": "gurudev_imports_inc",
        "jsonName": "gurudev_imports_inc.json",
        "emptyColumn": false,
        "databaseName": "gurudev_imports_inc"
    },
    {
        "value": "mysha_distributors_llc",
        "slug": "mysha_distributors_llc",
        "jsonName": "mysha_distributors_llc.json",
        "emptyColumn": false,
        "databaseName": "mysha_distributors_llc"
    },
    {
        "value": "anka_foods_inc",
        "slug": "anka_foods_inc",
        "jsonName": "anka_foods_inc.json",
        "emptyColumn": false,
        "databaseName": "anka_foods_inc"
    },
    {
        "value": "anmol distributor2",
        "slug": "anmol-distributor2",
        "jsonName": "anmol-distributor2",
        "emptyColumn": false,
        "databaseName": "anmol distributor2"
    },
    {
        "value": "fabi saa",
        "slug": "fabi-saa",
        "jsonName": "fabi-saa.json",
        "emptyColumn": false,
        "databaseName": "fabi saa food"
    },
    {
        "value": "dairy not just milk",
        "slug": "dairy-not-just-milk",
        "jsonName": "dairy-not-just-milk",
        "emptyColumn": false,
        "databaseName": "dairy not just milk"
    },
    {
        "value": "Solid Trade",
        "slug": "solid-trade",
        "jsonName": "solid-trade.json",
        "emptyColumn": true,
        "databaseName": "solidtrade"
    },
    {
        "value": "colonial_produce",
        "slug": "colonial_produce",
        "jsonName": "colonial_produce.json",
        "emptyColumn": false,
        "databaseName": "colonial_produce"
    },
    {
        "value": "bikaji_food",
        "slug": "bikaji_food",
        "jsonName": "bikaji_food.json",
        "emptyColumn": false,
        "databaseName": "bikaji_food"
    },
    {
        "value": "endico_potatoes",
        "slug": "endico_potatoes",
        "jsonName": "endico_potatoes.json",
        "emptyColumn": false,
        "databaseName": "endico_potatoes"
    },
    {
        "value": "ewp_89",
        "slug": "ewp_89",
        "jsonName": "ewp_89.json",
        "emptyColumn": false,
        "databaseName": "ewp_89"
    },
    {
        "value": "arya international",
        "slug": "arya-international",
        "jsonName": "arya-international.json",
        "emptyColumn": false,
        "databaseName": "arya international"
    },
    {
        "value": "sumitra remedies",
        "slug": "sumitra-remedies",
        "jsonName": "sumitra-remedies.json",
        "emptyColumn": false,
        "databaseName": "sumitra remedies"
    },
    {
        "value": "jhp_distributor_llc",
        "slug": "jhp_distributor_llc",
        "jsonName": "jhp_distributor_llc.json",
        "emptyColumn": true,
        "databaseName": "jhp_distributor_llc"
    },
    {
        "value": "Barlett dairy",
        "slug": "bartlett-dairy",
        "jsonName": "barlett.json",
        "emptyColumn": false,
        "databaseName": "barletts"
    },
    {
        "value": "dream_pack",
        "slug": "dream_pack",
        "jsonName": "dream_pack.json",
        "emptyColumn": false,
        "databaseName": "dream_pack"
    },
    {
        "value": "krasdale_new",
        "slug": "krasdale_new",
        "jsonName": "krasdale_new.json",
        "emptyColumn": false,
        "databaseName": "krasdale_new"
    },
    {
        "value": "ibs_india_llc",
        "slug": "ibs_india_llc",
        "jsonName": "ibs_india_llc.json",
        "emptyColumn": false,
        "databaseName": "ibs_india_llc"
    },
    {
        "value": "shahnawaz_food",
        "slug": "shahnawaz_food",
        "jsonName": "shahnawaz_food.json",
        "emptyColumn": false,
        "databaseName": "shahnawaz_food"
    },
    {
        "value": "nirwana_foods",
        "slug": "nirwana_foods",
        "jsonName": "nirwana_foods.json",
        "emptyColumn": false,
        "databaseName": "nirwana_foods"
    },
    {
        "value": "kgf_llc",
        "slug": "kgf_llc",
        "jsonName": "kgf_llc.json",
        "emptyColumn": false,
        "databaseName": "kgf_llc"
    },
    {
        "value": "guruji_blessing",
        "slug": "guruji_blessing",
        "jsonName": "guruji_blessing.json",
        "emptyColumn": false,
        "databaseName": "guruji_blessing"
    },
    {
        "value": "mahika_foods",
        "slug": "mahika_foods",
        "jsonName": "mahika_foods.json",
        "emptyColumn": false,
        "databaseName": "mahika_foods"
    },
    {
        "value": "sepl_global",
        "slug": "sepl_global",
        "jsonName": "sepl_global.json",
        "emptyColumn": false,
        "databaseName": "sepl_global"
    },
    {
        "value": "rajdeep_enterprises",
        "slug": "rajdeep_enterprises",
        "jsonName": "rajdeep_enterprises.json",
        "emptyColumn": false,
        "databaseName": "rajdeep_enterprises"
    },
    {
        "value": "rudra_usa",
        "slug": "rudra_usa",
        "jsonName": "rudra_usa.json",
        "emptyColumn": false,
        "databaseName": "rudra_usa"
    },
    {
        "value": "vr_brothers_llc",
        "slug": "vr_brothers_llc",
        "jsonName": "vr_brothers_llc.json",
        "emptyColumn": false,
        "databaseName": "vr_brothers_llc"
    },
    {
        "value": "ios organic",
        "slug": "ios-organic",
        "jsonName": "ios-organic.json",
        "emptyColumn": false,
        "databaseName": "ios organic"
    },
    {
        "value": "devik",
        "slug": "devik",
        "jsonName": "devik.json",
        "emptyColumn": false,
        "databaseName": "devik"
    },
    {
        "value": "kotecha_brothers_new",
        "slug": "kotecha_brothers_new",
        "jsonName": "kotecha_brothers_new.json",
        "emptyColumn": false,
        "databaseName": "kotecha_brothers_new"
    },
    {
        "value": "bangkok_market",
        "slug": "bangkok_market",
        "jsonName": "bangkok_market.json",
        "emptyColumn": false,
        "databaseName": "bangkok_market"
    },
    {
        "value": "yee_sing_trading_inc",
        "slug": "yee_sing_trading_inc",
        "jsonName": "yee_sing_trading_inc.json",
        "emptyColumn": false,
        "databaseName": "yee_sing_trading_inc"
    },
    {
        "value": "ryeco",
        "slug": "ryeco",
        "jsonName": "ryeco.json",
        "emptyColumn": false,
        "databaseName": "ryeco"
    },
    {
        "value": "ariana_meats",
        "slug": "ariana_meats",
        "jsonName": "ariana_meats.json",
        "emptyColumn": false,
        "databaseName": "ariana_meats"
    },
    {
        "value": "ac_beverages_llc",
        "slug": "ac_beverages_llc",
        "jsonName": "ac_beverages_llc.json",
        "emptyColumn": false,
        "databaseName": "ac_beverages_llc"
    },
    {
        "value": "my_babys_bev_inc",
        "slug": "my_babys_bev_inc",
        "jsonName": "my_babys_bev_inc.json",
        "emptyColumn": false,
        "databaseName": "my_babys_bev_inc"
    },
    {
        "value": "ariana_sweets",
        "slug": "ariana_sweets",
        "jsonName": "ariana_sweets.json",
        "emptyColumn": false,
        "databaseName": "ariana_sweets"
    },
    {
        "value": "shivron_enterprise_llc",
        "slug": "shivron_enterprise_llc",
        "jsonName": "shivron_enterprise_llc.json",
        "emptyColumn": false,
        "databaseName": "shivron_enterprise_llc"
    },
    {
        "value": "mindful_organics_llc",
        "slug": "mindful_organics_llc",
        "jsonName": "mindful_organics_llc.json",
        "emptyColumn": false,
        "databaseName": "mindful_organics_llc"
    },
    {
        "value": "indian_cookware_&_appliance",
        "slug": "indian_cookware_&_appliance",
        "jsonName": "indian_cookware_&_appliance.json",
        "emptyColumn": false,
        "databaseName": "indian_cookware_&_appliance"
    },
    {
        "value": "hathi_brand_foods_inc",
        "slug": "hathi_brand_foods_inc",
        "jsonName": "hathi_brand_foods_inc.json",
        "emptyColumn": false,
        "databaseName": "hathi_brand_foods_inc"
    },
    {
        "value": "hathi_brand_foods_inc_2",
        "slug": "hathi_brand_foods_inc_2",
        "jsonName": "hathi_brand_foods_inc_2.json",
        "emptyColumn": false,
        "databaseName": "hathi_brand_foods_inc_2"
    },
    {
        "value": "maharaja_farmers_market",
        "slug": "maharaja_farmers_market",
        "jsonName": "maharaja_farmers_market.json",
        "emptyColumn": false,
        "databaseName": "maharaja_farmers_market"
    },
    {
        "value": "sunrise_food_distributor_inc",
        "slug": "sunrise_food_distributor_inc",
        "jsonName": "sunrise_food_distributor_inc.json",
        "emptyColumn": false,
        "databaseName": "sunrise_food_distributor_inc"
    },
    {
        "value": "grace_kennedy_food_2",
        "slug": "grace_kennedy_food_2",
        "jsonName": "grace_kennedy_food_2.json",
        "emptyColumn": false,
        "databaseName": "grace_kennedy_food_2"
    },
    {
        "value": "shrinath_2",
        "slug": "shrinath_2",
        "jsonName": "shrinath_2.json",
        "emptyColumn": true,
        "databaseName": "shrinath_2"
    },
    {
        "value": "bathgate",
        "slug": "bathgate",
        "jsonName": "bathgate.json",
        "emptyColumn": true,
        "databaseName": "bathgate"
    },
    {
        "value": "gms_int'l_foods_inc",
        "slug": "gms_int'l_foods_inc",
        "jsonName": "gms_int'l_foods_inc.json",
        "emptyColumn": true,
        "databaseName": "gms_int'l_foods_inc"
    },
    {
        "value": "singh_bakery",
        "slug": "singh_bakery",
        "jsonName": "singh_bakery.json",
        "emptyColumn": false,
        "databaseName": "singh_bakery"
    },
    {
        "value": "chill_chain_inc",
        "slug": "chill_chain_inc",
        "jsonName": "chill_chain_inc.json",
        "emptyColumn": false,
        "databaseName": "chill_chain_inc"
    },
    {
        "value": "aneja_distributors_inc",
        "slug": "aneja_distributors_inc",
        "jsonName": "aneja_distributors_inc.json",
        "emptyColumn": true,
        "databaseName": "aneja_distributors_inc"
    },
    {
        "value": "kashmir_crown_baking",
        "slug": "kashmir_crown_baking",
        "jsonName": "kashmir_crown_baking.json",
        "emptyColumn": true,
        "databaseName": "kashmir_crown_baking"
    },
    {
        "value": "darrigo_bros",
        "slug": "darrigo_bros",
        "jsonName": "darrigo_bros.json",
        "emptyColumn": false,
        "databaseName": "darrigo_bros"
    },
    {
        "value": "big_geyser_inc",
        "slug": "big_geyser_inc",
        "jsonName": "big_geyser_inc.json",
        "emptyColumn": false,
        "databaseName": "big_geyser_inc"
    },
    {
        "value": "goya_online",
        "slug": "goya_online",
        "jsonName": "goya_online.json",
        "emptyColumn": false,
        "databaseName": "goya_online"
    },
    {
        "value": "pepsico_beverages_company",
        "slug": "pepsico_beverages_company",
        "jsonName": "pepsico_beverages_company.json",
        "emptyColumn": false,
        "databaseName": "pepsico_beverages_company"
    },
    {
        "value": "art_of_spice_foods_inc",
        "slug": "art_of_spice_foods_inc",
        "jsonName": "art_of_spice_foods_inc.json",
        "emptyColumn": false,
        "databaseName": "art_of_spice_foods_inc"
    },
    {
        "value": "challenge_dairy",
        "slug": "challenge_dairy",
        "jsonName": "challenge_dairy.json",
        "emptyColumn": false,
        "databaseName": "challenge_dairy"
    },
    {
        "value": "royalty_foods_inc",
        "slug": "royalty_foods_inc",
        "jsonName": "royalty_foods_inc.json",
        "emptyColumn": true,
        "databaseName": "royalty_foods_inc"
    },
    {
        "value": "biscuit_delivery",
        "slug": "biscuit_delivery",
        "jsonName": "biscuit_delivery.json",
        "emptyColumn": false,
        "databaseName": "biscuit_delivery"
    },
    {
        "value": "success_beverage_cor",
        "slug": "success_beverage_cor",
        "jsonName": "success_beverage_cor.json",
        "emptyColumn": false,
        "databaseName": "success_beverage_cor"
    },
    {
        "value": "xpressions",
        "slug": "xpressions",
        "jsonName": "xpressions.json",
        "emptyColumn": false,
        "databaseName": "xpressions"
    },
    {
        "value": "angur_fresh_inc",
        "slug": "angur_fresh_inc",
        "jsonName": "angur_fresh_inc.json",
        "emptyColumn": false,
        "databaseName": "angur_fresh_inc"
    },
    {
        "value": "vibrant food",
        "slug": "vibrant-food",
        "jsonName": "vibrant-food.json",
        "emptyColumn": true,
        "databaseName": "vibrant food"
    },
    {
        "value": "jaymin_enterprises_corp",
        "slug": "jaymin_enterprises_corp",
        "jsonName": "jaymin_enterprises_corp.json",
        "emptyColumn": false,
        "databaseName": "jaymin_enterprises_corp"
    },
    {
        "value": "sensational_farm_fresh",
        "slug": "sensational_farm_fresh",
        "jsonName": "sensational_farm_fresh.json",
        "emptyColumn": false,
        "databaseName": "sensational_farm_fresh"
    },
    {
        "value": "krystal_fruits_&_veg",
        "slug": "krystal_fruits_&_veg",
        "jsonName": "krystal_fruits_&_veg.json",
        "emptyColumn": false,
        "databaseName": "krystal_fruits_&_veg"
    },
    {
        "value": "empire_halal_meat",
        "slug": "empire_halal_meat",
        "jsonName": "empire_halal_meat.json",
        "emptyColumn": false,
        "databaseName": "empire_halal_meat"
    },
    {
        "value": "gnadf_llc",
        "slug": "gnadf_llc",
        "jsonName": "gnadf_llc.json",
        "emptyColumn": false,
        "databaseName": "gnadf_llc"
    },
    {
        "value": "darbar_food",
        "slug": "darbar_food",
        "jsonName": "darbar_food.json",
        "emptyColumn": false,
        "databaseName": "darbar_food"
    },
    {
        "value": "dabjj_inc",
        "slug": "dabjj_inc",
        "jsonName": "dabjj_inc.json",
        "emptyColumn": false,
        "databaseName": "dabjj_inc"
    },
    {
        "value": "raivansa_inc",
        "slug": "raivansa_inc",
        "jsonName": "raivansa_inc.json",
        "emptyColumn": false,
        "databaseName": "raivansa_inc"
    },
    {
        "value": "ontime_distribution_inc_2",
        "slug": "ontime_distribution_inc_2",
        "jsonName": "ontime_distribution_inc_2.json",
        "emptyColumn": false,
        "databaseName": "ontime_distribution_inc_2"
    },
    {
        "value": "psm",
        "slug": "psm",
        "jsonName": "psm.json",
        "emptyColumn": false,
        "databaseName": "psm"
    },
    {
        "value": "best_way_amen",
        "slug": "best_way_amen",
        "jsonName": "best_way_amen.json",
        "emptyColumn": false,
        "databaseName": "best_way_amen"
    },
    {
        "value": "rani_foods_inc",
        "slug": "rani_foods_inc",
        "jsonName": "rani_foods_inc.json",
        "emptyColumn": false,
        "databaseName": "rani_foods_inc"
    },
    {
        "value": "laish_associates",
        "slug": "laish_associates",
        "jsonName": "laish_associates.json",
        "emptyColumn": false,
        "databaseName": "laish_associates"
    },
    {
        "value": "go_direct_foods_distro",
        "slug": "go_direct_foods_distro",
        "jsonName": "go_direct_foods_distro.json",
        "emptyColumn": false,
        "databaseName": "go_direct_foods_distro"
    },
    {
        "value": "crown_of_east",
        "slug": "crown_of_east",
        "jsonName": "crown_of_east.json",
        "emptyColumn": false,
        "databaseName": "crown_of_east"
    },
    {
        "value": "l_r_b_r_distributors",
        "slug": "l_r_b_r_distributors",
        "jsonName": "l_r_b_r_distributors.json",
        "emptyColumn": false,
        "databaseName": "l_r_b_r_distributors"
    },
    {
        "value": "exotic_growers_inc",
        "slug": "exotic_growers_inc",
        "jsonName": "exotic_growers_inc.json",
        "emptyColumn": false,
        "databaseName": "exotic_growers_inc"
    },
    {
        "value": "comercial_mexicana_internacional",
        "slug": "comercial_mexicana_internacional",
        "jsonName": "comercial_mexicana_internacional.json",
        "emptyColumn": false,
        "databaseName": "comercial_mexicana_internacional"
    },
    {
        "value": "plato_market_llc",
        "slug": "plato_market_llc",
        "jsonName": "plato_market_llc.json",
        "emptyColumn": false,
        "databaseName": "plato_market_llc"
    },
    {
        "value": "new_desi_bazar",
        "slug": "new_desi_bazar",
        "jsonName": "new_desi_bazar.json",
        "emptyColumn": false,
        "databaseName": "new_desi_bazar"
    },
    {
        "value": "all_brothers_bakery_distributors",
        "slug": "all_brothers_bakery_distributors",
        "jsonName": "all_brothers_bakery_distributors.json",
        "emptyColumn": false,
        "databaseName": "all_brothers_bakery_distributors"
    },
    {
        "value": "jetro",
        "slug": "jetro",
        "jsonName": "jetro.json",
        "emptyColumn": true,
        "databaseName": "jetro"
    },
    {
        "value": "c_&_s_beverage_distribution",
        "slug": "c_&_s_beverage_distribution",
        "jsonName": "c_&_s_beverage_distribution.json",
        "emptyColumn": false,
        "databaseName": "c_&_s_beverage_distribution"
    },
    {
        "value": "egg_plus",
        "slug": "egg_plus",
        "jsonName": "egg_plus.json",
        "emptyColumn": false,
        "databaseName": "egg_plus"
    },
    {
        "value": "aadya_food_2",
        "slug": "aadya_food_2",
        "jsonName": "aadya_food_2.json",
        "emptyColumn": true,
        "databaseName": "aadya_food_2"
    },
    {
        "value": "lucky_traders",
        "slug": "lucky_traders",
        "jsonName": "lucky_traders.json",
        "emptyColumn": false,
        "databaseName": "lucky_traders"
    },
    {
        "value": "eastcost",
        "slug": "eastcost",
        "jsonName": "eastcost.json",
        "emptyColumn": false,
        "databaseName": "eastcost"
    },
    {
        "value": "avr_food_llc",
        "slug": "avr_food_llc",
        "jsonName": "avr_food_llc.json",
        "emptyColumn": false,
        "databaseName": "avr_food_llc"
    },
    {
        "value": "kb_farm_tx",
        "slug": "kb_farm_tx",
        "jsonName": "kb_farm_tx.json",
        "emptyColumn": false,
        "databaseName": "kb_farm_tx"
    },
    {
        "value": "sensational_farm_fresh_2",
        "slug": "sensational_farm_fresh_2",
        "jsonName": "sensational_farm_fresh_2.json",
        "emptyColumn": false,
        "databaseName": "sensational_farm_fresh_2"
    },
    {
        "value": "samra_produce",
        "slug": "samra_produce",
        "jsonName": "samra_produce.json",
        "emptyColumn": false,
        "databaseName": "samra_produce"
    },
    {
        "value": "kp_and_pb_inc_dba_korea_paper",
        "slug": "kp_and_pb_inc_dba_korea_paper",
        "jsonName": "kp_and_pb_inc_dba_korea_paper.json",
        "emptyColumn": true,
        "databaseName": "kp_and_pb_inc_dba_korea_paper"
    },
    {
        "value": "cream_o_land_dairy_inc",
        "slug": "cream_o_land_dairy_inc",
        "jsonName": "cream_o_land_dairy_inc.json",
        "emptyColumn": true,
        "databaseName": "cream_o_land_dairy_inc"
    },
    {
        "value": "foodline_usa_inc",
        "slug": "foodline_usa_inc",
        "jsonName": "foodline_usa_inc.json",
        "emptyColumn": true,
        "databaseName": "foodline_usa_inc"
    },
    {
        "value": "shakti_group_2",
        "slug": "shakti_group_2",
        "jsonName": "shakti_group_2.json",
        "emptyColumn": false,
        "databaseName": "shakti_group_2"
    },
    {
        "value": "Turkana food",
        "slug": "turkana-food",
        "jsonName": "turkana.json",
        "emptyColumn": false,
        "databaseName": "turkanas"
    },
    {
        "value": "delphia",
        "slug": "delphia",
        "jsonName": "delphia.json",
        "emptyColumn": false,
        "databaseName": "delphia"
    },
    {
        "value": "prima group",
        "slug": "prima-group",
        "jsonName": "prima-group.json",
        "emptyColumn": false,
        "databaseName": "prima group"
    },
    {
        "value": "jamaica_meat_packing_group",
        "slug": "jamaica_meat_packing_group",
        "jsonName": "jamaica_meat_packing_group.json",
        "emptyColumn": false,
        "databaseName": "jamaica_meat_packing_group"
    },
    {
        "value": "devsoo_farms_llc",
        "slug": "devsoo_farms_llc",
        "jsonName": "devsoo_farms_llc.json",
        "emptyColumn": false,
        "databaseName": "devsoo_farms_llc"
    },
    {
        "value": "delight_food",
        "slug": "delight_food",
        "jsonName": "delight_food.json",
        "emptyColumn": false,
        "databaseName": "delight_food"
    },
    {
        "value": "taste_of_the_east",
        "slug": "taste_of_the_east",
        "jsonName": "taste_of_the_east.json",
        "emptyColumn": false,
        "databaseName": "taste_of_the_east"
    },
    {
        "value": "hope_packing_corp",
        "slug": "hope_packing_corp",
        "jsonName": "hope_packing_corp.json",
        "emptyColumn": false,
        "databaseName": "hope_packing_corp"
    },
    {
        "value": "psv_trade_inc",
        "slug": "psv_trade_inc",
        "jsonName": "psv_trade_inc.json",
        "emptyColumn": false,
        "databaseName": "psv_trade_inc"
    },
    {
        "value": "j_margiotta_company",
        "slug": "j_margiotta_company",
        "jsonName": "j_margiotta_company.json",
        "emptyColumn": false,
        "databaseName": "j_margiotta_company"
    },
    {
        "value": "westminster_meat_packing",
        "slug": "westminster_meat_packing",
        "jsonName": "westminster_meat_packing.json",
        "emptyColumn": true,
        "databaseName": "westminster_meat_packing"
    },
    {
        "value": "sarwar_food_distribution",
        "slug": "sarwar_food_distribution",
        "jsonName": "sarwar_food_distribution.json",
        "emptyColumn": false,
        "databaseName": "sarwar_food_distribution"
    },
    {
        "value": "j&n_distribution",
        "slug": "j&n_distribution",
        "jsonName": "j&n_distribution.json",
        "emptyColumn": true,
        "databaseName": "j&n_distribution"
    },
    {
        "value": "mendez",
        "slug": "mendez",
        "jsonName": "mendez.json",
        "emptyColumn": false,
        "databaseName": "mendez"
    },
    {
        "value": "iberia_foods",
        "slug": "iberia_foods",
        "jsonName": "iberia_foods.json",
        "emptyColumn": true,
        "databaseName": "iberia_foods"
    },
    {
        "value": "sky_vision_trading",
        "slug": "sky_vision_trading",
        "jsonName": "sky_vision_trading.json",
        "emptyColumn": false,
        "databaseName": "sky_vision_trading"
    },
    {
        "value": "best_food_2",
        "slug": "best_food_2",
        "jsonName": "best_food_2.json",
        "emptyColumn": false,
        "databaseName": "best_food_2"
    },
    {
        "value": "fresh_pro",
        "slug": "fresh_pro",
        "jsonName": "fresh_pro.json",
        "emptyColumn": false,
        "databaseName": "fresh_pro"
    },
    {
        "value": "sukhdev_dola",
        "slug": "sukhdev_dola",
        "jsonName": "sukhdev_dola.json",
        "emptyColumn": false,
        "databaseName": "sukhdev_dola"
    },
    {
        "value": "parma_nand",
        "slug": "parma_nand",
        "jsonName": "parma_nand.json",
        "emptyColumn": false,
        "databaseName": "parma_nand"
    },
    {
        "value": "mangalam_distro",
        "slug": "mangalam_distro",
        "jsonName": "mangalam_distro.json",
        "emptyColumn": false,
        "databaseName": "mangalam_distro"
    }
]

const dummyInvoices = [
  { id: 1, invoiceNo: "INV-1001", invoiceDate: "2025-08-01" },
  { id: 2, invoiceNo: "INV-1002", invoiceDate: "2025-08-03" },
  { id: 3, invoiceNo: "INV-1003", invoiceDate: "2025-08-05" },
];

export default function VendorAndInvoiceSearch() {
      const navigation = useNavigation(); 
  const [step, setStep] = useState("vendor"); // "vendor" | "invoice"
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredVendors, setFilteredVendors] = useState(VendorList);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [invoiceList, setInvoiceList] = useState(dummyInvoices);

  // vendor search
  const handleVendorSearch = (text) => {
    setSearchTerm(text);
    if (text.trim() === "") {
      setFilteredVendors(VendorList);
      return;
    }
    const results = VendorList.filter((vendor) =>
      vendor.value.toLowerCase().startsWith(text.toLowerCase())
    );
    setFilteredVendors(results);
  };

  // invoice search
  const handleInvoiceSearch = (text) => {
    setInvoiceSearch(text);
    if (text.trim() === "") {
      setInvoiceList(dummyInvoices);
      return;
    }
    const results = dummyInvoices.filter((inv) =>
      inv.invoiceNo.toLowerCase().includes(text.toLowerCase())
    );
    setInvoiceList(results);
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      {step === "vendor" ? (
        <>
          <TextInput
            value={searchTerm}
            onChangeText={handleVendorSearch}
            placeholder="Search Vendor..."
            style={{
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 8,
              padding: 10,
              marginBottom: 10,
            }}
          />

          <FlatList
            data={filteredVendors}
            keyExtractor={(item) => item.slug}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  setSelectedVendor(item);
                  setStep("invoice");
                }}
                style={{
                  padding: 12,
                  borderBottomWidth: 1,
                  borderColor: "#eee",
                }}
              >
                <Text style={{ fontSize: 16 }}>{item.value}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={() => (
              <Text style={{ textAlign: "center", color: "#888", marginTop: 20 }}>
                No vendors found
              </Text>
            )}
          />
        </>
      ) : (
        <>
          <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
            Invoices for {selectedVendor?.value}
          </Text>

          <TextInput
            value={invoiceSearch}
            onChangeText={handleInvoiceSearch}
            placeholder="Search Invoice No..."
            style={{
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 8,
              padding: 10,
              marginBottom: 10,
            }}
          />

          <FlatList
            data={invoiceList}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item, index }) => (
              <View
                style={{
                  flexDirection: "row",
                  padding: 10,
                  borderBottomWidth: 1,
                  borderColor: "#ddd",
                  backgroundColor: index % 2 === 0 ? "#fafafa" : "#fff",
                }}
              >
                <Text style={{ flex: 1 }}>{item.invoiceNo}</Text>
                <Text style={{ flex: 1 }}>{item.invoiceDate}</Text>
                <TouchableOpacity style={{ flex: 1 }}
                onPress={() => navigation.navigate('InvoiceDetails', { id: item.id })}>
                  <Text style={{ color: "blue" }}>Open</Text>
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={() => (
              <Text style={{ textAlign: "center", color: "#888", marginTop: 20 }}>
                No invoices found
              </Text>
            )}
          />

          <TouchableOpacity
            onPress={() => {
              setStep("vendor");
              setSelectedVendor(null);
              setInvoiceSearch("");
              setInvoiceList(dummyInvoices);
            }}
            style={{
              marginTop: 20,
              padding: 12,
              backgroundColor: "red",
              borderRadius: 8,
            }}
          >
            <Text style={{ color: "white", textAlign: "center" }}>
              Back to Vendor Search
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

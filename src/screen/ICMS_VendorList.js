import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

// Example vendor list (you can replace this with API response later)
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
]

export default function ICMS_VendorList() {
  const navigation = useNavigation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredVendors, setFilteredVendors] = useState([]);

  useEffect(() => {
    // initial sort (new invoices first)
    const sorted = [...VendorList].sort((a, b) => {
      if (a.number_of_newInvoice < b.number_of_newInvoice) return 1;
      if (a.number_of_newInvoice > b.number_of_newInvoice) return -1;
      return 0;
    });
    setFilteredVendors(sorted);
  }, []);

  const handleVendorSearch = (text) => {
    setSearchTerm(text);

    let results = [...VendorList];
    if (text.trim() !== '') {
      results = results.filter(vendor =>
        vendor.value.toLowerCase().includes(text.toLowerCase())
      );
    }

    // always sort so vendors with new invoices are on top
    results.sort((a, b) => {
      if (a.number_of_newInvoice < b.number_of_newInvoice) return 1;
      if (a.number_of_newInvoice > b.number_of_newInvoice) return -1;
      return 0;
    });

    setFilteredVendors(results);
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <TextInput
        value={searchTerm}
        onChangeText={handleVendorSearch}
        placeholder="Search Vendor..."
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
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
            onPress={() => navigation.navigate('InvoiceList', { vendor: item })}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 12,
              borderBottomWidth: 1,
              borderColor: '#eee',
            }}
          >
            <Text style={{ fontSize: 16 }}>{item.value}</Text>

            {item.number_of_newInvoice > 0 && (
              <View
                style={{
                  backgroundColor: 'red',
                  borderRadius: 12,
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                }}
              >
                <Text style={{ color: 'white', fontSize: 12 }}>
                  {item.number_of_newInvoice} New
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={() => (
          <Text style={{ textAlign: 'center', color: '#888', marginTop: 20 }}>
            No vendors found
          </Text>
        )}
      />
    </View>
  );
}

exports.BattleScripts = {
        init: function() {
                for (var i in this.data.Pokedex) {
                        var tier = '';
                        var adjustment = 0;
       if (this.data.FormatsData[i]) tier = this.data.FormatsData[i].tier;
       switch (tier) {
+      case 'Uber':        
+              adjustment = 25;
+        break;
+      case 'OU':
       case 'BL':
       case 'UU':
-        adjustment = 5;
+        adjustment = 30;
         break;
       case 'BL2':
       case 'RU':
-        adjustment = 10;
+        adjustment = 35;
         break;
       case 'BL3':
       case 'NU':
       case 'NFE':
       case 'LC':
-        adjustment = 15;
+        adjustment = 40;
       }
 
       if (adjustment) {
                                this.data.Pokedex[i].baseStats.hp += adjustment;
                                this.data.Pokedex[i].baseStats.atk += adjustment;
                                this.data.Pokedex[i].baseStats.def += adjustment;
                                this.data.Pokedex[i].baseStats.spa += adjustment;
                                this.data.Pokedex[i].baseStats.spd += adjustment;
                                this.data.Pokedex[i].baseStats.spe += adjustment;
                        }
                }
        }
};

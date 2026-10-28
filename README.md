# Raktári kereső

- `index.html`: PDA felület
- `admin.html`: admin felület (kóddal védett): félretett polc, címkenyomtatás
- `sql/`: adatbázis frissítések, a Supabase SQL Editorban kell egyszer lefuttatni

Az adatok a Supabase adatbázisban vannak, a repó csak a programot tartalmazza.

## Válogatás a kalodákból (PDA)

1. **Válogatás fül**: szkenneld a kalodából kivett terméket.
   - **Ide tedd**: egy már nyitott dobozba kell. A doboz utolsó 4 számjegye nagyban látszik, a darab be is számolódik.
   - **Tedd félre**: egyik nyitott dobozba sem kell. Új dobozt **nem** nyitunk neki, a félretett polcra kerül.
   - **Felesleg**: egyik dobozba sem kell több belőle.
   - Doboz címkét is lehet szkennelni: megnyitja vagy megmutatja a dobozt.
2. **Félretett fül**: az **összegyűlt** doboz (minden darabja a polcon van) a következő doboz.
   Az „Összeraktam” gombbal a darabok a dobozba kerülnek, a doboz kész. Alatta a legközelebb álló dobozok és a polc tartalma.
3. **Dobozok fül**: a dobozok az utolsó 4 számjegy szerint sorban, ahogy a polcon állnak. Itt van a nem olvasható címkéjű doboz azonosítása is.

## Frissítés v2.2-re

Futtasd le egyszer a `sql/v2.2_felretett_polc.sql` fájlt a Supabase SQL Editorban.
Ettől lesz a félretett polc közös az összes eszközön. Amíg nincs lefuttatva, minden PDA csak a saját félretett termékeit látja.

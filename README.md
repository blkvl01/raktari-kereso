# Raktári kereső

- `index.html`: PDA felület
- `admin.html`: admin felület (kóddal védett): félretett polc, címkenyomtatás
- `sql/`: adatbázis frissítések, a Supabase SQL Editorban kell egyszer lefuttatni

Az adatok a Supabase adatbázisban vannak, a repó csak a programot tartalmazza.

## Válogatás a kalodákból (PDA)

1. **Válogatás fül**: szkenneld a kalodából kivett terméket.
   - **Ide tedd**: egy már nyitott dobozba kell. A doboz utolsó 4 számjegye nagyban látszik, a darab be is számolódik.
   - **Nincs nyitott doboza**: a program rákérdez, **Félreteszem** vagy **Új doboz**. Magától nem nyit új dobozt.
     Új doboznál a legjobb jelöltet ajánlja (amelyiket a polc + ez a darab a legjobban lefedi), és a polcról is behúzza, ami belekell.
     Ha döntés nélkül szkennelnek tovább, az csak rákeresés volt: a termék **nem** kerül a polcra (a naplóban „csak keresés”). Polcra csak a **Félreteszem** gomb tesz.
   - **Felesleg**: egyik dobozba sem kell több belőle.
   - Doboz címkét is lehet szkennelni: megnyitja vagy megmutatja a dobozt.
2. **Félretett fül**: az **összegyűlt** doboz (minden darabja a polcon van) a következő doboz.
   Az „Összeraktam” gombbal a darabok a dobozba kerülnek, a doboz kész. Alatta a legközelebb álló dobozok és a polc tartalma.
   A fül tetején lévő mezővel kézzel is polcra tehető, ami már félre van téve (szól, ha nyitott doboz várja vagy felesleg); a sorok +/− gombjával a darabszám javítható.
   Az admin Félretett oldalán kód + darabszám megadásával is lehet polcra tenni. Ugyanitt a napló alapján azok a termékek is látszanak, amelyeket nyitott doboz nélkül szkenneltek, de nincsenek a polcon; egy gombbal felvehetők.
3. **Dobozok fül**: a dobozok az utolsó 4 számjegy szerint sorban, ahogy a polcon állnak. Itt van a nem olvasható címkéjű doboz azonosítása is.

## Kereső (admin)

Az admin **Kereső** oldalán (és a fejléc gyorskeresőjében) dobozra, SKU-ra (kód, kódrészlet vagy terméknév) és AWB-re (szám, vége vagy jelölés) lehet keresni.
Pontos találatnál azonnal a részletek látszanak, több találatnál típusonként csoportosított lista.

- **Doboz**: státusz, AWB, ki vette fel és mikor, lezárás ideje, tartalom tételenként (mennyi került bele, belőtték-e, ki jelölte, van-e a polcon, milyen más dobozba kell még), hiányok, polc-lefedettség, napló.
- **SKU**: mennyi van a goodslistben, mennyi került dobozba, mennyi kell még nyitott és fel nem vett dobozba, polc, belövések, dobozonkénti bontás.
- **AWB**: dobozok állapota (szűrhető), darab, súly, eszközök, hiánnyal lezárt tételek, összegyűlt dobozok, napló.

Minden doboz, termék és AWB kattintható, a böngésző Vissza gombja is működik.

## Frissítés v2.2-re

Futtasd le egyszer a `sql/v2.2_felretett_polc.sql` fájlt a Supabase SQL Editorban.
Ettől lesz a félretett polc közös az összes eszközön. Amíg nincs lefuttatva, minden PDA csak a saját félretett termékeit látja.

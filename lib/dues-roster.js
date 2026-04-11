/**
 * Dues-paying member roster for check-in verification (UGA NSBE).
 * Names are deduped by a canonical token key (order-independent "First Last" / "Last, First").
 */

const RAW_DUES_LINES = `
Aaron Bagger
Aaron, Attipoe
Abygail Abebe
Afia, Lockett
Aja Wooldridge
Akilah, Parrish
Akir Goode
Amous,Toure
Artisan Jenkins
Asha, Cole
Avanie Baptiste
Ayo Balogun
Aziza Hussein
Brielle White
Bryce Murray
Caleb Bell-Spratling
Chizua, Ndukwe
Christian Hewling
Dillon Richburg
Elizabeth Tulloch
Emmanuel Onuoha
Emmanuel Segun
Gavin smith
Hawa Iman
Israel Salami
Jaden Terry
Jonathan Okushi
Joshua,Wilson
Kara, Gibson
Kayin Coaxum
Kelly Patterson
Kendall Haynes
Kieran Nyaga
Kyle, McDole
Kylee, Kassi
Kyra Francois
Laylah Lewis
Mekelle Ezekiel
Melayah Gatlin
Myriah, Bennett
Paige Fears
Rachael, Owolabi
Raphael, Aduamah
Rayna Robinson
Rodney Bargaineer
Roman jones
Royal Adegunloye
Ryan, Ford
Sharon, Agbita
Solomon Okhawe
Temiloluwa, Ojedapo
Temitope, Agbaje
William, Anderson
Xavier Willis
Zakiya McPherson
Zoe Cannon
Zoriyah Menefee
Penuel Yeboah
Anolita Hirsch
Paul Dawit
Jayson Pealer
Marleigh Freelon
Wade Reid
Oumou, Barry
Alice, Quansah
Olivia, Arcement
Besydone Tuoyo
Alisha, Mikell
Maryanne Momeh
Chloe, Sullivan
Nylah Richburg
Emmanuella (Emma) Oliver
Ara Ganiyu
Allyson, Nwajei
Kaelin,Wilson
Bernard Munyengango
Charles Edwards
Jah Duncombe
Abraham Adokwei
Wayne Allick, Jr.
Onochie Ikegbunam
Olusola, Victory
Pierce Daniels
Chigekwu Chukwuezi
Gabrielle Veazie
Deborah Madden
Jalen Edusei
Fathiya Ally
Sara Gebreyohannes
Amiri Jones
Gabriel Stewart
Ibby Dokubo-Wizzdom
Alaina Crisostomo
Brandon Noel
Emeka Eronini
Jason Wallace
Uche Onwukeme
Temi Agbaje
Nuru Kibare
Aspen Williams
Isaiah Ferguson
Jasmine Allen
Bo Shu
Crispin Kabongo
James Nwadike
Bakoma Itoe
Temi Ojedapo
Caleb Bell
Bess Tuoyo
Noah Kahsay
Barry Oumou
Chloe Sullivan
Thaddee Barge
Major Ellis
Osinachi Ohanu
Raiah Wright
Ara Ganyiu
Naima Marshall
Benedict Ikegbunam
Ilissa Valentine
Victory Olusola
Pierce Daniel
`.trim().split(/\n/);

/** Lowercase, drop parentheticals, normalize commas/hyphens/dots, tokenize. */
function tokensForMatch(s) {
  if (!s || typeof s !== "string") return [];
  let n = s
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")
    .replace(/,/g, " ")
    .replace(/-/g, " ")
    .replace(/\./g, " ")
    .replace(/\s+/g, " ")
    .trim();
  n = n.replace(/\bjr\b|\bsr\b|\bii\b|\biii\b|\biv\b/g, "").replace(/\s+/g, " ").trim();
  return n.split(" ").filter((t) => t.length > 0);
}

/** Sorted token string — same person whether they type "Last, First" or "First Last". */
export function canonicalDuesKey(displayName) {
  const t = tokensForMatch(displayName);
  if (t.length === 0) return "";
  return t.slice().sort().join(" ");
}

function buildDuesKeySet() {
  const set = new Set();
  for (const line of RAW_DUES_LINES) {
    const trimmed = line.trim();
    if (!trimmed || /^name\s*\(/i.test(trimmed)) continue;
    const key = canonicalDuesKey(trimmed);
    if (key) set.add(key);
  }
  return set;
}

const DUES_KEYS = buildDuesKeySet();

/** True if the entered name matches a dues-paying member (normalized). */
export function isDuesPayingMember(displayName) {
  const key = canonicalDuesKey(displayName);
  if (!key) return false;
  if (DUES_KEYS.has(key)) return true;
  return false;
}

/** Roster match OR admin manual confirmation — only then may this device cast a vote. */
export function isCheckinEligibleToVote(displayName, duesVerifiedManual) {
  return isDuesPayingMember(displayName) || Boolean(duesVerifiedManual);
}

/** Approximate roster size after dedupe (for UI). */
export function duesRosterCount() {
  return DUES_KEYS.size;
}

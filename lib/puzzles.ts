import { Puzzle, TOOLKIT, Word } from "./game";

// Authored seed scenes rotate from a fixed UTC anchor. Private answer/coda data stays server-only.
const scenes = [
  ["The Gloomy Doorstep", "A single candle gutters beside a heavy oak door locked from the outside. A small brass key lies in the dust.", "Escape the study.", "USE", "KEY", "ON", "OAK", "DOOR", "The key turns with a gratifying clunk. The door swings wide!", "Cold air off the moor brushes your face.", "The candle gutters flat behind you.", "Whatever snuffled under the door has gone quiet.", "The draft under the door has a story to tell.", "What would fit the lock?"],
  ["The Bell in the Fog", "A harbor bell hangs silent above the fog. Its bronze clapper has fallen beside the salt-stiff rope.", "Warn the boats.", "HANG", "CLAPPER", "ON", "BRONZE", "BELL", "The bell rings over the water, bright as morning.", "A gull answers from somewhere unseen.", "The fog loosens its hold on the harbor.", "One by one, the boats turn safely home.", "What has fallen from the bell?", "Which sound could reach through fog?"],
  ["A Very Small Volcano", "A tiny volcano burbles in the school garden. A jar of cool water waits beside a red clay crater.", "Calm the crater.", "POUR", "WATER", "INTO", "CLAY", "CRATER", "The volcano sighs, and a perfect daisy pops up.", "Steam curls into a shape like a hat.", "The garden smells faintly of rain.", "A beetle applauds from the path.", "What is bubbling?", "What could cool it down?"],
  ["The Moonlit Pantry", "A midnight mouse is trapped behind a pantry door with a silver latch. A crumbly wedge of cheese rests on the floor.", "Free the mouse.", "PULL", "LATCH", "ON", "SILVER", "DOOR", "The latch gives, and the mouse salutes with a crumb.", "Tiny feet patter toward the moonlight.", "The pantry settles into a comfortable hush.", "Somewhere, a very small feast begins.", "What is holding the door shut?", "Look closely at the latch."],
  ["The Sleeping Dragon", "A drowsy dragon blocks the mountain pass, curled around a kettle. Its favorite blue lullaby book lies open nearby.", "Get past quietly.", "READ", "LULLABY", "TO", "BLUE", "DRAGON", "The dragon dreams of clouds and rolls aside.", "A warm puff makes the snow sparkle.", "The pass opens beneath the stars.", "The kettle sings one last sleepy note.", "What makes the dragon sleepy?", "Which book is already open?"],
  ["The Lighthouse's Last Wink", "The lighthouse has gone dark. A fresh wick and a little tin of oil sit beside its green glass lamp.", "Light the way.", "PUT", "WICK", "IN", "GREEN", "LAMP", "The lamp blooms gold; ships answer with tiny lights.", "The sea draws a silver road to shore.", "A keeper's window glows above the rocks.", "The lighthouse winks once, just for you.", "What is missing from the lamp?", "What can fuel a flame?"],
  ["The Garden Gate", "A garden gate is tangled in a stubborn vine. A pair of blunt shears lies by the thyme patch.", "Open the path.", "CUT", "VINE", "WITH", "GREEN", "SHEARS", "The vine parts, revealing a garden full of strawberries.", "Bees resume their gentle errands.", "The gate swings on a freshly freed hinge.", "A robin claims the path as its own.", "What is tangled in the gate?", "What tool is waiting nearby?"],
  ["The Clockwork Sparrow", "A clockwork sparrow has stopped mid-song. Its brass key is beside the little bird, whose gears need a turn.", "Start the song again.", "USE", "KEY", "IN", "BRASS", "SPARROW", "The sparrow sings, and every clock in town joins in.", "A gear catches with a soft tick.", "The workshop window fills with morning.", "The sparrow bows, then asks for breakfast.", "What powers a clockwork toy?", "Where does the key belong?"],
  ["The Well's Echo", "A silver bucket is stuck in the village well. A frayed rope reaches down into the dark water.", "Bring the bucket up.", "PULL", "BUCKET", "WITH", "FRAYED", "ROPE", "The bucket rises full of stars—or very clear water.", "The rope sings against the stone rim.", "A cool breeze escapes the well.", "The village gathers for a midnight drink.", "What is down in the well?", "What can bring it up?"],
  ["The Unlocked Treasure", "A cedar chest in the attic is stuck fast. A small iron handle has come loose and lies beside it.", "Open the chest.", "USE", "HANDLE", "ON", "CEDAR", "CHEST", "The chest opens to reveal a map to the bakery.", "A little dust cloud looks like a crown.", "The attic window brightens with dawn.", "The map smells deliciously of cinnamon.", "What part has come loose?", "What kind of chest is it?"],
  ["The Snowbound Postbox", "A red postbox is frozen shut. A red woolly mitten and a paper letter wait on the snowy step.", "Deliver the letter.", "OPEN", "POSTBOX", "WITH", "RED", "MITTEN", "The letter slips inside and warms the mailbox's heart.", "A snowflake melts on the little flag.", "The postbox gives a grateful click.", "Somewhere, someone is about to smile.", "What is frozen shut?", "What might keep your hand warm?"],
  ["The River's Message", "A paper boat is stranded in a puddle beside the river. A willow leaf floats nearby, broad as a sail.", "Send it downstream.", "PUT", "LEAF", "ON", "PAPER", "BOAT", "The boat sails off carrying a leaf-sized message.", "The current hums a traveling tune.", "A duck escorts it around the bend.", "The river keeps the secret safely.", "What could carry the boat along?", "What is stranded?"],
  ["The Velvet Curtain", "A little theater's velvet curtain is stuck on its rail. A golden ring dangles just out of reach.", "Begin the show.", "PULL", "RING", "ON", "VELVET", "CURTAIN", "The curtain parts to reveal a stage full of tap-dancing crabs.", "The footlights blink awake.", "A hush rolls through the empty seats.", "The show must go on, even for one.", "What is caught on the rail?", "What can you pull?"],
  ["The Kite Tree", "A yellow kite is caught high in an old apple tree. Its blue tail hangs just low enough to reach.", "Bring the kite down.", "PULL", "TAIL", "ON", "YELLOW", "KITE", "The kite tumbles down into waiting hands.", "The branches wave goodbye.", "A breeze offers to try again.", "The sky makes room for another flight.", "What is caught in the tree?", "Which part can you reach?"],
  ["The Quiet Library", "A book has fallen behind the library's oak shelf. A long wooden ruler leans against the reading desk.", "Retrieve the book.", "PUSH", "BOOK", "WITH", "WOODEN", "RULER", "The book slides free, open to a very good ending.", "A dust mote drifts like a tiny comet.", "The library keeps its peaceful silence.", "The librarian smiles without looking up.", "What has fallen behind the shelf?", "What long tool is nearby?"],
  ["The Cloud's Lost Button", "A low gray cloud has snagged on a church steeple. Its bright brass button is caught on the weather vane.", "Set the cloud free.", "TAKE", "BUTTON", "FROM", "BRASS", "VANE", "The cloud floats away, leaving a pocketful of rainbows.", "The vane points toward a patch of blue.", "A gentle shower waters the square.", "The cloud waves from over the hills.", "What is snagged on the vane?", "Where is the cloud caught?"],
  ["The Lighthouse Cat", "Marmalade the cat is perched on the old lighthouse roof. A striped scarf trails down toward the high balcony.", "Help Marmalade down.", "PULL", "CAT", "TO", "HIGH", "BALCONY", "Marmalade steps down and demands a second breakfast.", "The scarf sways like a very soft ladder.", "A purr vibrates through the railing.", "The lighthouse keeper pretends not to worry.", "Who is up on the roof?", "What reaches the balcony?"],
  ["The Frozen Fountain", "The town fountain is frozen into a blue glass sculpture. A warm copper kettle steams beside it.", "Wake the fountain.", "POUR", "WATER", "ONTO", "BLUE", "FOUNTAIN", "The fountain burbles awake and splashes the mayor's hat.", "A ribbon of meltwater finds the drain.", "Pigeons return to their favorite ledge.", "The square sounds like summer again.", "What is frozen?", "What can melt the ice?"],
  ["The Lost Parade", "A paper dragon has lost its red paper tongue before the parade. A bottle of paste sits beside the bamboo frame.", "Finish the dragon.", "USE", "PASTE", "ON", "PAPER", "DRAGON", "The dragon grins wide enough to lead the parade.", "The drums try out a celebratory roll.", "Children gather with ribbon streamers.", "The dragon's shadow dances down the street.", "What is missing from the dragon?", "What can attach the new piece?"],
  ["The Night Train", "The toy train is stopped at a tiny brass bridge. Its lever is stuck beneath the bridge, under a velvet station sign.", "Send the train onward.", "PULL", "LEVER", "UNDER", "BRASS", "BRIDGE", "The train crosses the bridge with a whistle for the moon.", "The wheels find their familiar rhythm.", "A sleepy passenger waves from the caboose.", "The tracks lead somewhere pleasantly unknown.", "What is stuck beneath the bridge?", "What can move the bridge?"],
  ["The Rainy-Day Window", "Rain has painted the greenhouse window cloudy. A dry linen cloth rests beside a pot of sleeping seeds.", "Let the sunshine in.", "WIPE", "WINDOW", "WITH", "LINEN", "CLOTH", "Sunlight spills in and the seeds stretch awake.", "A bright square warms the floor.", "The raindrops become tiny mirrors.", "Spring seems to arrive a little early.", "What is cloudy?", "What is soft and dry?"],
  ["The Museum's Missing Moon", "The museum's model moon has rolled beneath a display case. A long silver spoon is close enough to reach it.", "Retrieve the moon.", "PULL", "MOON", "WITH", "SILVER", "SPOON", "The moon returns to its orbit, no tides disturbed.", "The planets resume their patient turning.", "A child presses a nose to the glass.", "The curator lets out a very small sigh.", "What has rolled away?", "What long object can reach it?"],
  ["The Fox's Lantern", "A fox cub waits in the dusk beside a paper lantern. Its little candle has gone out in the breeze.", "Light the path home.", "LIGHT", "CANDLE", "IN", "PAPER", "LANTERN", "The lantern glows; the cub trots toward a familiar den.", "The dusk grows soft instead of dark.", "An owl watches from the fencepost.", "The path home is full of fireflies.", "What has gone out?", "Where does the candle belong?"],
  ["The Stubborn Jar", "A blue jar of blackberry jam refuses to open. A damp blue towel waits on the counter beside it.", "Open the jar.", "TURN", "LID", "ON", "BLUE", "JAR", "The lid pops; breakfast is saved from plain toast.", "A berry-sweet smell fills the kitchen.", "The towel earns its place in history.", "Someone brings out the warm scones.", "What part needs turning?", "What can help your grip?"],
  ["The Paper Crown", "The queen's paper crown blew onto the palace pond. A bamboo pole lies beside a tiny wooden boat.", "Rescue the crown.", "TAKE", "CROWN", "FROM", "PALACE", "POND", "The crown is rescued, and the queen crowns the boat captain.", "The boat makes a noble little bow.", "Water rings widen under the reeds.", "A frog requests an audience.", "What is floating in the pond?", "What long tool is nearby?"],
  ["The Dragon's Teacup", "A dragon has misplaced her favorite teacup in a pile of warm ash. The chipped cup's handle is still visible.", "Find the teacup.", "TAKE", "CUP", "FROM", "WARM", "ASH", "The dragon pours tea for two and offers you the good biscuits.", "A curl of steam draws a heart.", "The ash settles into a tidy mound.", "The afternoon becomes quite civilized.", "What is hidden in the ash?", "Which pile is still warm?"],
  ["The Harbor's Blue Door", "A blue door at the harbor store is jammed by a driftwood wedge. A coil of rough rope hangs nearby.", "Open the store.", "PULL", "WEDGE", "FROM", "BLUE", "DOOR", "The door opens to a room full of warm lanterns.", "The wedge rolls into the sand.", "A tide pool catches the last light.", "The harbor smells of salt and supper.", "What is jamming the door?", "Where is the wedge stuck?"],
  ["The Witch's Broom", "A witch's broom is tangled in the old pear tree. Its crooked wooden handle rests against the trunk.", "Free the broom.", "PULL", "BROOM", "FROM", "PEAR", "TREE", "The broom swoops down and politely waits by the gate.", "A pear lands in the grass with a plop.", "The branches untangle themselves.", "The witch is home just in time for tea.", "What is tangled in the branches?", "Which tree caught it?"],
  ["The Tiny Telescope", "A child cannot see the comet through the dusty brass telescope. A soft cotton cloth lies on the observatory table.", "See the comet.", "CLEAN", "LENS", "WITH", "BRASS", "TELESCOPE", "A comet streaks across the lens, right on schedule.", "The stars sharpen into pinpricks.", "The child makes a wish, just in case.", "The night holds still for one bright moment.", "What needs cleaning?", "Which instrument has the dusty lens?"],
  ["The Garden's Stone Door", "A mossy stone door blocks the secret garden. A plain iron key is tucked beneath a terracotta flowerpot.", "Enter the garden.", "USE", "KEY", "IN", "STONE", "DOOR", "The door opens onto a garden that has been waiting.", "Moss slips from the threshold.", "A hidden fountain starts to trickle.", "The garden remembers your name.", "What is hidden under the pot?", "What kind of door is it?"],
];

const pool: Word[] = [
  { word: "SPOON", kind: "object", isDecoy: true }, { word: "FLUTE", kind: "object", isDecoy: true },
  { word: "ROPE", kind: "object" }, { word: "WATER", kind: "object" }, { word: "CANDLE", kind: "object" },
  { word: "WINDOW", kind: "target" }, { word: "WELL", kind: "target" }, { word: "CUP", kind: "object" },
  { word: "SPOON", kind: "object" }, { word: "SHELL", kind: "object" }, { word: "BASKET", kind: "object" },
  { word: "CANDLE", kind: "target" }, { word: "GATE", kind: "target" }, { word: "TABLE", kind: "target" },
  { word: "HAT", kind: "object" }, { word: "BUTTON", kind: "object" }, { word: "MAP", kind: "object" },
  { word: "BELL", kind: "target" }, { word: "RIVER", kind: "target" }, { word: "CHEST", kind: "target" },
];

export const puzzles: Puzzle[] = scenes.map((row, index) => {
  const [title, scene, goal, verb, object, preposition, adjective, target, winText, ...tail] = row;
  const answer = [verb, object, preposition, "THE", adjective, target];
  const bespoke: Word[] = [
    ...(!TOOLKIT.includes(verb as typeof TOOLKIT[number]) ? [{ word: verb, kind: "verb" as const }] : []),
    { word: preposition, kind: "article" }, { word: "THE", kind: "article" }, { word: adjective, kind: "target" },
  ];
  const used = new Set([...TOOLKIT, ...answer, object, target]);
  const extras: Word[] = [];
  for (let step = 0; extras.length < 8; step++) {
    const candidate = pool[(index * 3 + step) % pool.length];
    if (!used.has(candidate.word) && !extras.some((entry) => entry.word === candidate.word)) {
      extras.push({ ...candidate, isDecoy: extras.length < 2 });
      used.add(candidate.word);
    }
  }
  const bank: Word[] = [{ word: object, kind: "object" }, { word: target, kind: "target" }, ...extras];
  return {
    id: `daily-${String(index + 1).padStart(2, "0")}`, title, scene, goal, guessesAllowed: 6,
    answer, winText, coda: tail.slice(0, 3), bank, bespoke,
    flavor: ["The scene waits, patient as a held breath.", "Somewhere nearby, a small thing shifts."],
    hints: tail.slice(3, 5),
  };
});

export const ANCHOR_DATE = "2026-10-01";

export function puzzleForDate(date: string): Puzzle {
  const parsed = new Date(`${date}T00:00:00.000Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) return puzzles[0];
  const anchor = new Date(`${ANCHOR_DATE}T00:00:00.000Z`);
  const days = Math.floor((parsed.getTime() - anchor.getTime()) / 86_400_000);
  return puzzles[((days % puzzles.length) + puzzles.length) % puzzles.length];
}

export function utcToday(): string { return new Date().toISOString().slice(0, 10); }

export function publicPuzzle(puzzle: Puzzle) {
  return {
    id: puzzle.id, title: puzzle.title, scene: puzzle.scene, goal: puzzle.goal,
    guessesAllowed: puzzle.guessesAllowed, bank: puzzle.bank.map(({ word, kind }) => ({ word, kind })),
    bespoke: puzzle.bespoke, toolkit: TOOLKIT, hintCount: puzzle.hints.length,
  };
}

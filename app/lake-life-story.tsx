type StoryPhoto = {
  src: string;
  alt: string;
  caption: string;
  interests: string[];
  className?: string;
};

const everydayPhotos: StoryPhoto[] = [
  {
    src: "/lake-life/sunset-swim.jpg",
    alt: "Family swimming in Klinger Lake beneath a vivid pink sunset",
    caption: "Stay in until the sky changes color.",
    interests: ["swimming", "family-time", "sunsets"],
    className: "storyPhotoWide",
  },
  {
    src: "/lake-life/dog-on-kayak.jpg",
    alt: "Golden retriever standing on an orange kayak beside the dock",
    caption: "Bring the dog. The lake is part of their vacation, too.",
    interests: ["dogs", "kayaking", "pet-friendly"],
  },
  {
    src: "/lake-life/kayaking-the-channels.jpg",
    alt: "Kayaker exploring a quiet, tree-lined Klinger Lake channel",
    caption: "Paddle beyond the open water and into the quiet channels.",
    interests: ["kayaking", "nature", "quiet"],
  },
  {
    src: "/lake-life/sailing-klinger-lake.jpg",
    alt: "Colorful sailboat crossing Klinger Lake on a bright summer day",
    caption: "Catch the wind—or simply watch the lake go by.",
    interests: ["boating", "sailing", "lake"],
  },
];

const ritualPhotos: StoryPhoto[] = [
  {
    src: "/lake-life/grilling-on-the-deck.jpg",
    alt: "Family member grilling lunch on the lakeside deck",
    caption: "Lunch comes off the grill with the water still in view.",
    interests: ["food", "deck", "family-time"],
  },
  {
    src: "/lake-life/family-game-night.jpg",
    alt: "Family gathered around the dining table for a board game",
    caption: "Rainy hours become the stories everyone retells.",
    interests: ["games", "rainy-days", "family-time"],
  },
  {
    src: "/lake-life/dog-at-sunset.jpg",
    alt: "Dog looking across Klinger Lake at a golden sunset",
    caption: "Then everybody slows down for sunset.",
    interests: ["dogs", "sunsets", "quiet"],
  },
];

const archivePhotos: StoryPhoto[] = [
  {
    src: "/lake-life/vintage-raft-day.jpg",
    alt: "Vintage family snapshot of children playing together on a lake raft",
    caption: "Raft days, before camera phones.",
    interests: ["heritage", "swimming", "family-time"],
  },
  {
    src: "/lake-life/vintage-cottage-kids.jpg",
    alt: "Vintage cottage snapshot of five children laughing together",
    caption: "The kind of cottage chaos that becomes family history.",
    interests: ["heritage", "kids", "family-time"],
  },
  {
    src: "/lake-life/matching-lake-suits.jpg",
    alt: "Two generations wearing matching flag swimsuits on the dock",
    caption: "Different generations. Same dock-day energy.",
    interests: ["traditions", "kids", "family-time"],
  },
  {
    src: "/lake-life/floating-on-the-lake.jpg",
    alt: "Family members relaxing together on a large lake float",
    caption: "There is always room for one more tradition.",
    interests: ["floating", "relaxing", "family-time"],
  },
];

const supportingPhotoSources = [
  "/lake-life/sunrise-over-klinger-lake.jpg",
  "/lake-life/rainbow-over-the-dock.jpg",
  "/lake-life/sparklers-on-the-deck.jpg",
  "/lake-life/fireworks-on-the-water.jpg",
];

export const lakeLifeStoryPhotoSources = [
  ...supportingPhotoSources,
  ...everydayPhotos.map((photo) => photo.src),
  ...ritualPhotos.map((photo) => photo.src),
  ...archivePhotos.map((photo) => photo.src),
];

export const lakeLifeStoryImages = [
  { src: supportingPhotoSources[0], description: "Sunrise over the docks at Klinger Lake, seen from The Vues lakeside deck" },
  { src: supportingPhotoSources[1], description: "Rainbow over Klinger Lake and the docks at The Vues" },
  { src: supportingPhotoSources[2], description: "Family holding sparklers on the deck at The Vues" },
  { src: supportingPhotoSources[3], description: "Fireworks reflected across Klinger Lake at night" },
  ...[...everydayPhotos, ...ritualPhotos, ...archivePhotos].map(({ src, alt }) => ({ src, description: alt })),
];

function StoryPhotoCard({ photo, archival = false }: { photo: StoryPhoto; archival?: boolean }) {
  return (
    <figure
      className={["storyPhoto", photo.className, archival ? "storyPhotoArchive" : ""].filter(Boolean).join(" ")}
      data-interests={photo.interests.join(" ")}
    >
      <img src={photo.src} alt={photo.alt} loading="lazy" decoding="async" />
      <figcaption>{photo.caption}</figcaption>
    </figure>
  );
}

export default function LakeLifeStory() {
  return (
    <section className="lakeLifeStory" id="lake-life" aria-labelledby="lake-life-heading">
      <div className="storyOpening">
        <div className="storyOpeningCopy">
          <p className="eyebrow">The life behind the listing</p>
          <h2 id="lake-life-heading">Come for the lake. Leave with a story.</h2>
          <p>
            The Vues is more than five bedrooms beside the water. It is barefoot mornings, dock lunches,
            one-more-swim sunsets and the rare kind of time when everyone is finally in the same place.
          </p>
          <div className="storySignals" aria-label="Lake life highlights">
            <span>On the water</span><span>Family time</span><span>Dogs welcome</span><span>Traditions</span>
          </div>
        </div>
        <figure className="storyOpeningImage" data-interests="sunrise quiet lake">
          <img src="/lake-life/sunrise-over-klinger-lake.jpg" alt="Sunrise breaking through the trees over the docks at Klinger Lake" loading="lazy" decoding="async" />
          <figcaption>First light from the lakeside deck.</figcaption>
        </figure>
      </div>

      <div className="storyChapter">
        <div className="storyChapterHeading">
          <p className="storyNumber">01</p>
          <div><p className="eyebrow">Your days here</p><h3>The lake sets the schedule.</h3></div>
          <p>Wake up slowly. Choose a kayak, a float or a seat on the dock. Stay out longer than planned.</p>
        </div>
        <div className="storyMosaic">{everydayPhotos.map((photo) => <StoryPhotoCard key={photo.src} photo={photo} />)}</div>
      </div>

      <figure className="storyBreather" data-interests="rainbow weather lake-view">
        <img src="/lake-life/rainbow-over-the-dock.jpg" alt="A rainbow stretching over Klinger Lake and the docks" loading="lazy" decoding="async" />
        <figcaption><span>Even the weather puts on a show.</span><small>View from The Vues</small></figcaption>
      </figure>

      <div className="storyChapter storyRituals">
        <div className="storyChapterHeading">
          <p className="storyNumber">02</p>
          <div><p className="eyebrow">The in-between moments</p><h3>This is where a stay becomes yours.</h3></div>
          <p>The best memories rarely need an itinerary: dinner on the deck, a game around the table, everyone watching the same sunset.</p>
        </div>
        <div className="storyTriptych">{ritualPhotos.map((photo) => <StoryPhotoCard key={photo.src} photo={photo} />)}</div>
      </div>

      <div className="storyArchive">
        <div className="storyArchiveIntro">
          <p className="storyNumber">03</p>
          <div className="storyArchiveCopy">
            <p className="eyebrow">The vintage Vues</p>
            <h3>Decades of lake life—and room for your chapter.</h3>
            <p>
              Roger and Waneta Bock made The Vues their retirement dream and filled it with family, faith and summers on Klinger Lake.
              The photographs changed. The feeling did not.
            </p>
          </div>
        </div>
        <div className="storyArchiveRail">{archivePhotos.map((photo) => <StoryPhotoCard key={photo.src} photo={photo} archival />)}</div>
      </div>

      <div className="storyFinale">
        <figure className="storyFinaleImage" data-interests="fireworks evenings traditions">
          <img src="/lake-life/fireworks-on-the-water.jpg" alt="Fireworks reflected across Klinger Lake with boats gathered on the water" loading="lazy" decoding="async" />
        </figure>
        <div className="storyFinaleCopy">
          <p className="eyebrow">Your turn at the lake</p>
          <h3>Start with a weekend. Take home a tradition.</h3>
          <p>Tell us who you are bringing and when you would like to come. We personally review every stay.</p>
          <a className="storyCta" href="#request">Request your dates <span aria-hidden="true">→</span></a>
        </div>
        <figure className="storySparkler" data-interests="sparklers evenings family-time">
          <img src="/lake-life/sparklers-on-the-deck.jpg" alt="Two family members holding sparklers on the deck at dusk" loading="lazy" decoding="async" />
        </figure>
      </div>
    </section>
  );
}

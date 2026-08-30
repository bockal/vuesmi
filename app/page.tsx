import AvailabilityCalendar from "./availability-calendar";
import BookingForm from "./booking-form";
import "./listing.css";
import "./instagram.css";
import InstallApp from "./install-app";

const GOOGLE_LISTING="https://maps.app.goo.gl/Q8psuLeMhAzbFGWGA";
const amenities=[["≋","100 ft private shoreline"],["⚓","Private dock / pier"],["☀","1,021 sq ft lakeside deck"],["◒","Kayaks included"],["↝","Pontoon / jet-ski rental · $100/day"],["⌁","Firepit"],["◉","Lake views"],["⌂","Full kitchen with quartz counters"],["♨","Indoor fireplace"],["⌁","High-speed Wi-Fi"],["▣","Smart TVs"],["❄","Central air conditioning"],["♨","Heating"],["◫","Washer and dryer"],["◇","Water softener and filtration"],["⚡","Universal electric vehicle charger"],["P","On-site parking"],["✓","Smoke and CO alarms"]];
const reviews=[
  {name:"Heather Voit",text:"Paradise in Michigan! Beautiful lake house with a fully equipped kitchen, plenty of space for a big…"},
  {name:"Becky Gash",text:"Clean, organized and spacious! The bathrooms and kitchen were updated and the house had a beautiful…"},
  {name:"Rachel Bock",text:"Great Kitchen and convenient location! very clean with great floors and a huge TV."}
];
const nearby=[
  {name:"Enjoy a full Klinger Lake day",text:"Swim from the private shoreline, launch the included kayaks, fish from the dock or spend the afternoon boating on this all-sports lake.",href:"https://sturgesyoung.com/plan-your-visit/"},
  {name:"Explore downtown Sturgis",text:"Browse local shops, galleries and Michigan-made goods, then settle in for dinner or coffee in the historic downtown district.",href:"https://www.michigan.org/city/sturgis"},
  {name:"Hike Camp Fort Hill and Timm Preserve",text:"Discover woodlands, shoreline and quiet nature trails close to the cottage—an easy change of pace from a day on the water.",href:"https://www.michigan.org/city/sturgis"},
  {name:"Take a Shipshewana day trip",text:"Visit Northern Indiana Amish Country for markets, handcrafted goods, theater, food and family-friendly attractions.",href:"https://visitshipshewana.org/things-to-do/"},
  {name:"Visit Pokagon State Park",text:"Hike wooded trails, enjoy Lake James beaches and boating, or return in winter for the famous refrigerated toboggan run.",href:"https://www.in.gov/dnr/state-parks/parks-lakes/pokagon-state-parktrine-state-recreation-area/"},
];
const faqs=[
  ["How many guests can The Vues accommodate?","The Vues sleeps up to 12 guests across five bedrooms and has three bathrooms, with generous indoor gathering areas and a 1,021-square-foot lakeside deck."],
  ["Is The Vues directly on Klinger Lake?","Yes. The home has approximately 100 feet of private shoreline, direct water access and a private dock or pier."],
  ["Are kayaks or boat rentals available?","Kayaks are included. A pontoon or jet-ski rental may be requested for $100 per day, subject to owner approval and availability."],
  ["Can I bring a pet?","One pet may be included with a $99 pet fee. Add the pet to your date request so the owners can review it with your stay."],
  ["Can I charge an electric vehicle?","Yes. The property includes a universal electric vehicle charger and on-site parking."],
  ["How does booking work?","Choose your dates and submit a request. The owners review every stay personally and email the approved total and payment instructions. Nothing is charged when you submit the form."],
];
const photos=[
  ["/property/cottage-from-water.webp","The Vues from Klinger Lake"],
  ["/property/deck-view.jpg","Sunset views from the lakeside deck"],
  ["/property/interior-to-lake.jpg","Lake views from inside the cottage"],
  ["/property/kitchen.jpg","Renovated kitchen with quartz counters"],
  ["/property/interior-great-room.webp","Open great room and dining space"],
  ["/property/street-arrival.jpg","A welcoming arrival at The Vues"],
  ["/property/review-kayaks.png","Kayaking on Klinger Lake"],
  ["/property/review-firepit.png","A lakeside evening by the fire"],
];
const structuredData={"@context":"https://schema.org","@graph":[
  {"@type":"LodgingBusiness","@id":"https://vuesmi.com/#lodging","name":"The Vues at Klinger Lake","alternateName":"The Vues","additionalType":"https://schema.org/VacationRental","url":"https://vuesmi.com/","description":"A five-bedroom lakefront vacation rental on Klinger Lake in Sturgis, Michigan, accommodating up to 12 guests with private shoreline, dock, kayaks and an EV charger.","image":photos.map(([src])=>`https://vuesmi.com${src}`),"address":{"@type":"PostalAddress","addressLocality":"Sturgis","addressRegion":"MI","postalCode":"49091","addressCountry":"US"},"sameAs":[GOOGLE_LISTING],"containsPlace":{"@type":"Accommodation","additionalType":"EntirePlace","occupancy":{"@type":"QuantitativeValue","maxValue":12,"value":12},"numberOfBedrooms":5,"numberOfBathroomsTotal":3,"amenityFeature":["ac","beachAccess","fireplace","heating","instantBookable","kitchen","privateBeachAccess","tv","washerDryer","wifi"].map(name=>({"@type":"LocationFeatureSpecification","name":name,"value":name==="instantBookable"?false:true}))}},
  {"@type":"FAQPage","@id":"https://vuesmi.com/#faq","mainEntity":faqs.map(([name,text])=>({"@type":"Question","name":name,"acceptedAnswer":{"@type":"Answer","text":text}}))}
]};

export default function Home(){return <main>
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(structuredData).replace(/</g,"\\u003c")}}/>
  <header className="listingNav"><a className="brand" href="#top">THE VUES</a><nav><a href="#details">About</a><a href="#availability">Availability</a><a href="#reviews">Reviews</a><a href="/owner" className="ownerLink">Owner</a></nav></header>
  <div className="listing" id="top">
    <section className="listingTitle"><div><p className="eyebrow">Private lakefront vacation rental</p><h1>Klinger Lake vacation rental in Sturgis, Michigan</h1><p><a href={GOOGLE_LISTING} target="_blank" rel="noreferrer">★ 5.0 on Google</a><span>·</span><strong>Sleeps 12</strong><span>·</span><u>5 bedrooms · 3 bathrooms</u></p><p className="seoIntro">Stay together at The Vues—a spacious, owner-managed lake house with 100 feet of private shoreline, a dock, kayaks, sunset views and an EV charger.</p></div><a className="share" href={GOOGLE_LISTING} target="_blank" rel="noreferrer">View on Google ↗</a></section>
    <section className="gallery fivePhotoGallery" aria-label="Property gallery"><img className="galleryMain" src="/property/cottage-from-water.webp" alt="The Vues cottage viewed from Klinger Lake"/><img src="/property/street-arrival.jpg" alt="Street arrival view of The Vues with flower boxes"/><img src="/property/interior-to-lake.jpg" alt="Bright view of Klinger Lake from the cottage"/><img src="/property/interior-great-room.webp" alt="Great room and dining area facing Klinger Lake"/><img src="/property/kitchen.jpg" alt="Bright renovated kitchen at The Vues"/><a className="allPhotos" href="https://my.matterport.com/show/?m=EoSVoDF7wqa" target="_blank" rel="noreferrer">▦ Explore the 3D tour</a></section>
    <div className="contentGrid"><div className="details" id="details"><section className="summary"><h2>Entire lakefront home on Klinger Lake</h2><p>12 guests · 5 bedrooms · 3 bathrooms · private waterfront</p></section><section className="featureList"><article><b>⌂</b><div><h3>A true family lake house</h3><p>A spacious year-round home with generous gathering spaces and room for extended family.</p></div></article><article><b>≋</b><div><h3>Right on the water</h3><p>Private shoreline, dock access, broad lake views and unforgettable sunsets.</p></div></article><article><b>✓</b><div><h3>Request-to-book only</h3><p>Every stay is reviewed personally. Nothing is charged until dates and pricing are approved.</p></div></article></section><section className="description"><h2>About this place</h2><p>Once you arrive at The Vues, the world slows down. The open living and dining area, stone fireplace, wall of lake-facing windows and direct water access make this a place for unhurried mornings and long evenings together.</p><p>Klinger Lake is an all-sports lake known for boating, swimming and fishing. The Vues is offered selectively to guests who will enjoy this family home with the same care.</p></section></div><aside id="request"><div className="bookingCard"><h2>Request your stay</h2><p className="cardNote">Enter dates and guests to send an availability request.</p><BookingForm/></div></aside></div>
    <section className="amenities amenityTour" aria-labelledby="amenities-heading"><div><h2 id="amenities-heading">What this place offers</h2><div className="amenityGrid">{amenities.map(([icon,label])=><div className="amenity" key={label}><span aria-hidden="true">{icon}</span><p>{label}</p></div>)}</div></div><div className="tourCard"><div><p className="eyebrow">See it for yourself</p><h2>Walk through every amenity.</h2><p>Explore the kitchen, gathering spaces, bedrooms and lake views in the interactive 3D tour.</p></div><iframe title="Interactive 3D tour of The Vues" src="https://my.matterport.com/show/?m=EoSVoDF7wqa" allowFullScreen allow="autoplay; fullscreen; web-share; xr-spatial-tracking"/><a href="https://my.matterport.com/show/?m=EoSVoDF7wqa" target="_blank" rel="noreferrer">Open the full 3D tour ↗</a></div></section>
    <section id="availability" className="availabilitySection"><AvailabilityCalendar/></section>
    <section id="reviews" className="reviews"><div className="reviewsHead"><div><p className="googleG">G</p><h2>5.0 · 3 Google reviews</h2><p>Guest stories and photos from Klinger Lake.</p></div><a href={GOOGLE_LISTING} target="_blank" rel="noreferrer">Read the reviews on Google ↗</a></div><div className="reviewRail"><ReviewCard review={reviews[0]}/><ReviewPhoto src="/property/deck-view.jpg" alt="Darker evening lake view shared by Heather" caption="Guest photo shared by Heather"/><ReviewCard review={reviews[1]}/><ReviewPhoto src="/property/review-firepit.png" alt="Couple enjoying a lakeside fire at sunset" caption="Evenings made for the lake"/><ReviewCard review={reviews[2]}/><ReviewPhoto src="/property/review-kayaks.png" alt="Guests kayaking in Klinger Lake" caption="Kayaks are included with every stay"/></div></section>
    <section className="nearby" aria-labelledby="nearby-heading"><p className="eyebrow">Plan your stay</p><h2 id="nearby-heading">Things to Do Near Klinger Lake</h2><p className="sectionLead">Make the lake your home base for outdoor adventures, local shopping and memorable day trips across Southwest Michigan and Northern Indiana.</p><ol className="nearbyGrid">{nearby.map((item,index)=><li key={item.name}><span>{index+1}</span><div><h3>{item.name}</h3><p>{item.text}</p><a href={item.href} target="_blank" rel="noreferrer">Explore this area ↗</a></div></li>)}</ol></section>
    <section className="faq" aria-labelledby="faq-heading"><p className="eyebrow">Know before you go</p><h2 id="faq-heading">Frequently Asked Questions</h2><div className="faqList">{faqs.map(([question,answer])=><details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div></section>
    <section className="photoGallery" aria-labelledby="photo-heading"><div className="photoGalleryHead"><div><p className="eyebrow">#TheVuesKlingerLake</p><h2 id="photo-heading">Photo Gallery</h2><p>Swipe through lake days, gathering spaces and favorite views from The Vues.</p></div><a href="#request">Request your stay ↑</a></div><div className="instagramRail">{photos.map(([src,caption])=><figure key={src}><img src={src} alt={caption} loading="lazy"/><figcaption><span className="miniBell">P</span><div><strong>The Vues at Klinger Lake</strong><p>{caption}</p></div></figcaption></figure>)}</div></section>
  </div>
  <footer><div className="brand">THE VUES</div><p>Klinger Lake · Sturgis, Michigan</p><div className="footerActions"><InstallApp/><a href="/owner">Owner calendar</a></div></footer>
</main>}

function ReviewCard({review}:{review:{name:string;text:string}}){return <article className="reviewCard"><span>★★★★★</span><blockquote>“{review.text}”</blockquote><h3>{review.name}</h3><a href={GOOGLE_LISTING} target="_blank" rel="noreferrer">Verified on Google ↗</a></article>}
function ReviewPhoto({src,alt,caption}:{src:string;alt:string;caption:string}){return <figure className="reviewPhoto"><img src={src} alt={alt}/><figcaption>{caption}</figcaption></figure>}



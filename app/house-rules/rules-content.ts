export const RULES_VERSION = "2026-09-26";

export const RULE_SECTIONS = [
  {
    number: "01",
    title: "Your stay",
    items: [
      "Maximum occupancy is 12 registered guests.",
      "No parties or events without written owner approval.",
      "Check-in is after 4:00 p.m.; check-out is by 10:00 a.m.",
      "Quiet hours are 10:00 p.m.–8:00 a.m. Please respect our neighbors and keep outdoor sound low.",
      "No smoking or vaping indoors.",
      "Park up to two vehicles in the driveway. Additional off-street parking is available; please keep access routes clear.",
      "Any exception to these policies must be approved by the owners in writing in advance.",
    ],
  },
  {
    number: "02",
    title: "Inside the home",
    items: [
      "Please treat the home, furnishings, appliances, linens and equipment with care.",
      "Promptly report any damage or safety concern.",
      "No daily housekeeping service is provided.",
      "Before departure, place soiled dishes in the dishwasher and run it, dispose of rubbish and recycling as instructed, and leave the home secured.",
      "Guests are responsible for damage beyond normal wear and tear and for unpaid charges associated with their stay.",
    ],
  },
  {
    number: "03",
    title: "Dock, lake & water safety",
    items: [
      "An adult must actively supervise children at the shoreline, dock and aboard any watercraft.",
      "Children and non-swimmers must wear a properly fitted life jacket near or on the water. Life jackets are recommended for everyone underway.",
      "No diving from the dock or shoreline; lake depth and conditions can change.",
      "No glass containers are permitted on the dock or aboard any boat or watercraft. Please use cans, plastic or other non-breakable containers near the water.",
      "Never operate a boat or personal watercraft while impaired.",
      "Follow all posted lake rules and applicable Michigan boating laws.",
      "Every operator of a motorized watercraft provided with the property must meet applicable Michigan boating-safety requirements and carry any required certification.",
      "Guests use the dock, shoreline, kayaks, pontoon and other recreational equipment at their own risk.",
    ],
  },
  {
    number: "04",
    title: "Pets",
    items: [
      "Pets are permitted only with advance owner approval.",
      "Approved pets must be included on the reservation and the applicable pet fee paid.",
      "Keep pets supervised, leashed outdoors and away from neighboring properties.",
      "Please clean up all waste and protect furniture, bedding and the shoreline.",
      "Guests are responsible for pet-related damage or excessive cleaning.",
    ],
  },
  {
    number: "05",
    title: "Cancellation",
    body: "Cancellations received by email at least seven full days before check-in qualify for a full refund. Cancellations received fewer than seven full days before check-in are not eligible for a full refund.",
  },
  {
    number: "06",
    title: "Personal property & assumption of risk",
    body: "The property is privately owned. Guests are responsible for their own belongings and acknowledge the inherent risks associated with use of a waterfront property, dock, boats, watercraft and recreational equipment.",
  },
] as const;

export const rulesPlainText = () =>
  RULE_SECTIONS.map((section) => {
    const details = "items" in section
      ? section.items.map((item) => `- ${item}`).join("\n")
      : section.body;
    return `${section.number}. ${section.title}\n${details}`;
  }).join("\n\n");

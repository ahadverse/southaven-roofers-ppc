import type { StaticImageData } from "next/image";

import ceilingWaterStain from "@/assets/images/ceiling-water-stain.jpg";
import crewReroofBrickHome from "@/assets/images/crew-reroof-brick-home.jpg";
import femaHailDocumenting from "@/assets/images/fema-hail-documenting.jpg";
import femaHailInspection from "@/assets/images/fema-hail-inspection.jpg";
import femaTarpHome from "@/assets/images/fema-tarp-home.jpg";
import femaTarpInstall from "@/assets/images/fema-tarp-install.jpg";
import flatRoofInstall from "@/assets/images/flat-roof-install.jpg";
import hailstones from "@/assets/images/hailstones.jpg";
import homeownerPhoneCall from "@/assets/images/homeowner-phone-call.jpg";
import insuranceHandshake from "@/assets/images/insurance-handshake.jpg";
import insurancePolicyReview from "@/assets/images/insurance-policy-review.jpg";
import metalRoofStandingSeam from "@/assets/images/metal-roof-standing-seam.jpg";
import roofInstallBrickHome from "@/assets/images/roof-install-brick-home.jpg";
import rooferCarryingShingles from "@/assets/images/roofer-carrying-shingles.jpg";
import rooferHarnessLadder from "@/assets/images/roofer-harness-ladder.jpg";
import rooferInstallingShingles from "@/assets/images/roofer-installing-shingles.jpg";
import rooferLadderInspection from "@/assets/images/roofer-ladder-inspection.jpg";
import rooferNailGunShingles from "@/assets/images/roofer-nail-gun-shingles.jpg";
import rooferReplacingShingles from "@/assets/images/roofer-replacing-shingles.jpg";
import shingleCloseup from "@/assets/images/shingle-closeup.jpg";
import southavenWaterTower from "@/assets/images/southaven-water-tower.jpg";
import stoneHouseReroof from "@/assets/images/stone-house-reroof.jpg";
import stormCloudsSuburb from "@/assets/images/storm-clouds-suburb.jpg";
import stormUprootedTree from "@/assets/images/storm-uprooted-tree.jpg";
import suburbanHome from "@/assets/images/suburban-home.jpg";
import tearoffBrickHome from "@/assets/images/tearoff-brick-home.jpg";
import underlaymentInstall from "@/assets/images/underlayment-install.jpg";
import usaceBlueRoof from "@/assets/images/usace-blue-roof.jpg";

export type License = "Pexels License" | "Unsplash License" | "Public domain (U.S. Government work)" | "CC BY-SA 3.0";

export type SiteImage = {
  src: StaticImageData;
  alt: string;
  /** CSS object-position for crops, e.g. "50% 30%" */
  position?: string;
  credit: { author: string; source: string; url: string; license: License; licenseUrl?: string };
};

const pexels = (author: string, slug: string) => ({
  author,
  source: "Pexels",
  url: `https://www.pexels.com/photo/${slug}/`,
  license: "Pexels License" as const,
  licenseUrl: "https://www.pexels.com/license/",
});

const commons = (author: string, file: string, license: License) => ({
  author,
  source: "Wikimedia Commons",
  url: `https://commons.wikimedia.org/wiki/File:${file}`,
  license,
  licenseUrl: license === "CC BY-SA 3.0" ? "https://creativecommons.org/licenses/by-sa/3.0/" : undefined,
});

export const images = {
  "roofer-nail-gun-shingles": {
    src: rooferNailGunShingles,
    alt: "Roofer using a nail gun to install new architectural asphalt shingles on a home",
    credit: pexels("Ryan Stephens", "professional-roofer-installing-shingles-on-new-roof-33404248"),
  },
  "crew-reroof-brick-home": {
    src: crewReroofBrickHome,
    alt: "Roofing crew replacing the shingle roof on a two-story brick home",
    credit: pexels("Pexels contributor", "workers-renovating-roof-of-brick-house-in-texas-37677476"),
  },
  "tearoff-brick-home": {
    src: tearoffBrickHome,
    alt: "Roofers tearing off a storm-damaged roof on a brick home before installing a new one",
    credit: pexels("Ryan Stephens", "roof-repair-and-construction-in-fort-worth-33404981"),
  },
  "stone-house-reroof": {
    src: stoneHouseReroof,
    alt: "Full roof replacement underway on a large brick and stone house",
    credit: pexels("Pexels contributor", "new-roof-installation-on-brick-house-in-texas-34304714"),
  },
  "roofer-installing-shingles": {
    src: rooferInstallingShingles,
    alt: "Roofer kneeling on a roof while fitting new asphalt shingles over underlayment",
    credit: pexels("Pexels contributor", "professional-roofing-installation-in-allen-texas-37677394"),
  },
  "roofer-replacing-shingles": {
    src: rooferReplacingShingles,
    alt: "Roofer replacing damaged shingles on a weathered asphalt shingle roof",
    credit: pexels("Pexels contributor", "handyman-putting-roof-tiles-on-roof-9431615"),
  },
  "underlayment-install": {
    src: underlaymentInstall,
    alt: "Roofer working over new synthetic underlayment and starter shingles during a re-roof",
    credit: pexels("Pexels contributor", "roofer-installing-shingles-on-a-sunny-day-38028508"),
  },
  "roof-install-brick-home": {
    src: roofInstallBrickHome,
    alt: "Roofers installing new shingles and underlayment on a brick house",
    credit: pexels("Pexels contributor", "roof-installation-on-brick-house-in-fort-worth-33404080"),
  },
  "roofer-ladder-inspection": {
    src: rooferLadderInspection,
    alt: "Roofer with a tool belt climbing a ladder to inspect a roof and chimney",
    position: "50% 25%",
    credit: pexels("Pexels contributor", "professional-roofer-climbing-ladder-near-chimney-34033126"),
  },
  "roofer-harness-ladder": {
    src: rooferHarnessLadder,
    alt: "Roofer wearing a safety harness climbing a ladder to a home's roof",
    position: "50% 30%",
    credit: pexels("Pexels contributor", "roofer-with-safety-gear-ascending-ladder-for-repair-38346725"),
  },
  "flat-roof-install": {
    src: flatRoofInstall,
    alt: "Roofer installing membrane roofing on a low-slope commercial roof",
    position: "50% 60%",
    credit: pexels("Pexels contributor", "roofer-working-on-a-flat-roof-in-daylight-38510748"),
  },
  "metal-roof-standing-seam": {
    src: metalRoofStandingSeam,
    alt: "Dark standing seam metal roof with a brick chimney under a blue sky",
    credit: pexels("Pexels contributor", "metal-roof-with-brick-chimney-against-blue-sky-39509195"),
  },
  hailstones: {
    src: hailstones,
    alt: "Hailstones scattered across a wet surface right after a hail storm",
    position: "50% 50%",
    credit: pexels("Pexels contributor", "hailstones-on-wooden-surface-after-storm-34429004"),
  },
  "shingle-closeup": {
    src: shingleCloseup,
    alt: "Close-up of the granule surface of asphalt roof shingles",
    credit: pexels("Pexels contributor", "selective-focus-of-black-and-brown-rocks-237907"),
  },
  "suburban-home": {
    src: suburbanHome,
    alt: "Two-story suburban home with a dark asphalt shingle roof at dusk",
    credit: pexels("Pexels contributor", "facade-of-house-17131036"),
  },
  "storm-clouds-suburb": {
    src: stormCloudsSuburb,
    alt: "Mammatus storm clouds rolling over a suburban neighborhood at dusk",
    credit: pexels("Pexels contributor", "dramatic-mammatus-clouds-over-suburban-houses-39264566"),
  },
  "storm-uprooted-tree": {
    src: stormUprootedTree,
    alt: "Large tree uprooted beside a suburban street after a severe wind storm",
    credit: pexels("Pexels contributor", "uprooted-tree-after-severe-storm-in-urban-area-32394146"),
  },
  "insurance-policy-review": {
    src: insurancePolicyReview,
    alt: "Homeowners reviewing a home insurance policy document on a clipboard",
    credit: pexels("Pexels contributor", "people-discussing-a-home-insurance-policy-7731335"),
  },
  "insurance-handshake": {
    src: insuranceHandshake,
    alt: "Homeowner shaking hands with a professional holding a home insurance policy",
    credit: pexels("Pexels contributor", "close-up-shot-of-people-handshaking-7734651"),
  },
  "homeowner-phone-call": {
    src: homeownerPhoneCall,
    alt: "Smiling homeowner talking on the phone at home",
    position: "50% 35%",
    credit: pexels("Pexels contributor", "man-relaxing-while-making-a-phone-call-at-home-39219399"),
  },
  "roofer-carrying-shingles": {
    src: rooferCarryingShingles,
    alt: "Roofer carrying a bundle of shingles across a roof deck during a replacement",
    credit: {
      author: "Zohair Mirza",
      source: "Unsplash",
      url: "https://unsplash.com/photos/person-carrying-shingles-on-roof-4XMHsy4Rvi8",
      license: "Unsplash License",
      licenseUrl: "https://unsplash.com/license",
    },
  },
  "fema-hail-inspection": {
    src: femaHailInspection,
    alt: "Damage assessor inspecting a metal roof after a severe hail storm",
    credit: commons(
      "Win Henderson / FEMA",
      "FEMA_-_44370_-_FEMA_PA_officer_documenting_damages_to_a_roof_in_OK.jpg",
      "Public domain (U.S. Government work)"
    ),
  },
  "fema-hail-documenting": {
    src: femaHailDocumenting,
    alt: "Inspector documenting hail damage on a building roof with a clipboard",
    credit: commons(
      "Win Henderson / FEMA",
      "FEMA_-_44372_-_FEMA_PA_officer_documenting_damage_to_a_hail_damaged_roof_in_OK.jpg",
      "Public domain (U.S. Government work)"
    ),
  },
  "fema-tarp-install": {
    src: femaTarpInstall,
    alt: "Worker nailing down a blue emergency tarp on a storm-damaged shingle roof",
    credit: commons(
      "Leif Skoogfors / FEMA",
      "FEMA_-_38954_-_A_worker_installs_a_blue_tarp_on_a_roof_in_Texas.jpg",
      "Public domain (U.S. Government work)"
    ),
  },
  "fema-tarp-home": {
    src: femaTarpHome,
    alt: "Blue tarp protecting a storm-damaged roof on a brick home",
    credit: commons(
      "Win Henderson / FEMA",
      "FEMA_-_44325_-_Blue_tarp_on_a_tornado_damaged_home_in_Oklahoma.jpg",
      "Public domain (U.S. Government work)"
    ),
  },
  "usace-blue-roof": {
    src: usaceBlueRoof,
    alt: "Worker securing a blue temporary roof covering after a storm",
    credit: commons(
      "U.S. Army Corps of Engineers",
      "Operation_Blue_Roof_Installation_(2883966742).jpg",
      "Public domain (U.S. Government work)"
    ),
  },
  "southaven-water-tower": {
    src: southavenWaterTower,
    alt: "The Southaven “Top of Mississippi” water tower on Starlanding Road in Southaven, MS",
    credit: commons("Thomas R Machnitzki", "Southaven_MS_04_Watertower_Starlanding_Rd.jpg", "CC BY-SA 3.0"),
  },
  "ceiling-water-stain": {
    src: ceilingWaterStain,
    alt: "Water stain on a ceiling caused by rainwater leaking through the roof",
    credit: commons("Ed! (Photography Gallery)", "Water_Damage.JPG", "CC BY-SA 3.0"),
  },
} satisfies Record<string, SiteImage>;

export type ImageKey = keyof typeof images;

export const isImageKey = (key: string): key is ImageKey => key in images;

export function getImage(key: string): SiteImage {
  if (!isImageKey(key)) throw new Error(`Unknown image key "${key}". Add it to lib/images.ts.`);
  return images[key];
}

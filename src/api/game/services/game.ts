/**
 * game service
 */

import axios from "axios";
import slugify from "slugify";
import { JSDOM } from "jsdom";
import { factories } from "@strapi/strapi";

async function getGameInfo(slug) {
  const gogSlug = slug.replaceAll("-", "_").toLowerCase();

  const body = await axios.get(`https://www.gog.com/game/${gogSlug}`);

  const dom = new JSDOM(body.data);

  const raw_description = dom.window.document.querySelector(".description");

  const description = raw_description.innerHTML;

  const short_description = raw_description.textContent.slice(0, 160);

  const ratingElement = dom.window.document.querySelector(
    ".age-restrictions__icon use"
  );

  return {
    description,
    short_description,
    rating: ratingElement
      ? ratingElement
          .getAttribute("xlink:href")
          .replace(/_/, "")
          .replace("#", "")
      : "BR0",
  };
}

async function getByName(name, entityService) {
  const item = await strapi.service(entityService).find({
    filters: { name },
  });

  return item.results.length > 0 ? item.results[0] : null;
}

async function create(name, entityService) {
  if (!name || !entityService) return;

  const item = await getByName(name, entityService);

  if (!item) {
    await strapi.service(entityService).create({
      data: {
        name,
        slug: slugify(name, { strict: true, lower: true }),
      },
    });
  }
}

export default factories.createCoreService("api::game.game", () => ({
  async populate(params) {
    const gogApiUrl = `https://catalog.gog.com/v1/catalog?limit=48&order=desc%3atrending`;

    const {
      data: { products },
    } = await axios.get(gogApiUrl);

    products[2].developers.map(async (developer) => {
      await create(developer, "api::developer.developer");
    });

    products[2].publishers.map(async (publisher) => {
      await create(publisher, "api::publisher.publisher");
    });

    products[2].genres.map(async ({ name }) => {
      await create(name, "api::category.category");
    });

    // console.log(getGameInfo(products[2].slug));
  },
}));

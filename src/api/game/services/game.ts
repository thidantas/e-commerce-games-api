/**
 * game service
 */

import axios from "axios";
import { factories } from "@strapi/strapi";

export default factories.createCoreService("api::game.game", () => ({
  async populate(params) {
    const gogApiUrl = `https://catalog.gog.com/v1/catalog?limit=48&order=desc%3atrending`;

    const {
      data: { products },
    } = await axios.get(gogApiUrl);

    console.log(products[0]);
  },
}));

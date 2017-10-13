import { action, computed, observable } from 'mobx';

import Store from './lib/Store';
import CachedRequest from './lib/CachedRequest';
import Request from './lib/Request';
import { matchRoute } from '../helpers/routing-helpers';

export default class RecipesStore extends Store {
  @observable allRecipesRequest = new CachedRequest(this.api.recipes, 'all');
  @observable installRecipeRequest = new Request(this.api.recipes, 'install');
  @observable getRecipeUpdatesRequest = new Request(this.api.recipes, 'update');

  constructor(...args) {
    super(...args);

    // Register action handlers
    this.actions.recipe.install.listen(this._install.bind(this));
    this.actions.recipe.update.listen(this._update.bind(this));
  }

  setup() {
    return this.all;
  }

  @computed get all() {
    return this.allRecipesRequest.execute().result || [];
  }

  @computed get active() {
    const match = matchRoute('/settings/services/add/:id', this.stores.router.location.pathname);
    if (match) {
      const activeRecipe = this.one(match.id);
      if (activeRecipe) {
        return activeRecipe;
      }

      console.warn('Recipe not installed');
    }

    return null;
  }

  @computed get recipeIdForServices() {
    return this.stores.services.all.map(s => s.recipe.id);
  }

  one(id) {
    return this.all.find(recipe => recipe.id === id);
  }

  isInstalled(id) {
    return !!this.one(id);
  }

  // Actions
  @action async _install({ recipeId }) {
    // console.log(this.installRecipeRequest._promise);
    const recipe = await this.installRecipeRequest.execute(recipeId)._promise;
    await this.allRecipesRequest.invalidate({ immediately: true })._promise;
    // console.log(this.installRecipeRequest._promise);

    return recipe;
  }

  @action async _update() {
    const recipeIds = this.recipeIdForServices;
    const recipes = {};
    recipeIds.forEach((r) => {
      const recipe = this.one(r);
      recipes[r] = recipe.version;
    });

    if (Object.keys(recipes).length === 0) return;

    const updates = await this.getRecipeUpdatesRequest.execute(recipes)._promise;
    const length = updates.length - 1;
    const syncUpdate = async (i) => {
      const update = updates[i];

      this.actions.recipe.install({ recipeId: update });
      await this.installRecipeRequest._promise;

      this.installRecipeRequest.reset();

      if (i === length) {
        this.stores.ui.showServicesUpdatedInfoBar = true;
      } else if (i < length) {
        syncUpdate(i + 1);
      }
    };

    if (length >= 0) {
      syncUpdate(0);
    }
  }
}

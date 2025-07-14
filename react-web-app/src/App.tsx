import RecipeCard  from "./components/RecipeCard.tsx";
import testRecipeJson from './json/test-recipe.json' with { type : 'json' }
import Sidebar from "./components/Sidebar.tsx";
import sidebarIcon from './assets/cookbook-icon.svg'
import sidebarIconBlack from './assets/cookbook-icon-black.svg'
import {useState} from "react";
import type {Recipe} from "./interfaces/Recipe.ts";


const testRecipe = testRecipeJson as Recipe

export function App() {
    // sets current mode based on user preference and adds a listener in case they change their mind
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const [isDarkMode, setDarkMode] = useState(prefersDarkMode)
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
        setDarkMode(event.matches)
    });
    return (
      <>
          <Sidebar
              icon={<img src={ isDarkMode ? sidebarIcon : sidebarIconBlack } alt='Sidebar Icon'></img>}
              title={<span>Simple Recipes</span>}
              content={[
                  <div>About</div>,
                  <div>New Recipe</div>,
                  <div>Recipe Search</div>,
                  <a href='https://github.com/azrinsler/cloud-resume/tree/main/react-web-app'>GitHub</a>,
                  <div>Donate</div>
              ]}
          >
          </Sidebar>
          <div className='flex-column' style={{width:'100%',placeContent:'center',placeItems:'center',padding:'1em'}}>
              <RecipeCard
                  title={testRecipe.title}
                  ingredients={testRecipe.ingredients}
                  items={testRecipe.items}
                  steps={testRecipe.steps}>
              </RecipeCard>
          </div>
      </>
  )
}


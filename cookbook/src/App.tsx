import RecipeCard  from "./components/RecipeCard.tsx";
import testRecipeJson from './json/test-recipe.json' with { type : 'json' }
import Sidebar from "./components/Sidebar.tsx";
import sidebarIcon from './assets/cookbook-icon.svg'
import sidebarIconBlack from './assets/cookbook-icon-black.svg'
import {useEffect, useState} from "react";
import type {Recipe} from "./interfaces/Recipe.ts";


const testRecipe = testRecipeJson as Recipe

export function App() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // sets current mode based on user preference and adds a listener in case they change their mind
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const [isDarkMode, setDarkMode] = useState(prefersDarkMode)
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
        setDarkMode(event.matches)
    });

    useEffect(() => {
        fetch("https://api.azrinsler.com/GetRecipeLambda", {
                    signal: AbortSignal.timeout(120 * 1000),
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "https://api.azrinsler.com/GetRecipeLambda"
                    },
                    body: JSON.stringify({ "recipeId": "12345" })
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((jsonData) => {
                setData(jsonData);
                setLoading(false);
                console.log(data);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, [data] );

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
      <>
          <Sidebar
              icon={<img src={ isDarkMode ? sidebarIcon : sidebarIconBlack } alt='Sidebar Icon'></img>}
              title={<span>Simple Recipes</span>}
              content={[
                  <div>About</div>,
                  <div>New Recipe</div>,
                  <div>Recipe Search</div>,
                  <a href='https://github.com/azrinsler/cloud-resume/tree/main/cookbook'>GitHub</a>,
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


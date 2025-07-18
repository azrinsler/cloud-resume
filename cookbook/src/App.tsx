import RecipeCard  from "./components/RecipeCard.tsx";
import testRecipeJson from './json/test-recipe.json' with { type : 'json' }
import Sidebar from "./components/Sidebar.tsx";
import sidebarIcon from './assets/cookbook-icon.svg'
import sidebarIconBlack from './assets/cookbook-icon-black.svg'
import {useEffect, useState} from "react";
import type {Recipe} from "./interfaces/Recipe.ts";
import About from "./components/About.tsx";
import Browse from "./components/Browse.tsx";


const testRecipe = testRecipeJson as Recipe

export function App() {
    const [sidebarOption, setSidebarOption] = useState("about")
    const [data, setData] = useState(testRecipe);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // sets current mode based on user preference and adds a listener in case they change their mind
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const [isDarkMode, setDarkMode] = useState(prefersDarkMode)
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
        setDarkMode(event.matches)
    });

    useEffect(() => {
        // this calls a Lambda which has a cold start time and may need a few seconds if it hasn't been used recently
        if (loading) {
            fetch("https://api.azrinsler.com/RecipeLambda", {
                signal: AbortSignal.timeout(120 * 1000),
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "https://api.azrinsler.com/RecipeLambda"
                }, // recipe 12345 is a test recipe for stovetop rice... about as basic as it gets
                body: JSON.stringify({ "operation":"searchById","recipeId":"12345" })
            })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((jsonData) => {
                if (jsonData != null) {
                    const data = jsonData as Recipe
                    setData(data);
                    console.log(data);
                    setLoading(false);
                    setSidebarOption("recipe")
                }
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
        }
    }, [data, loading] );

    return (
      <>
          <Sidebar
              icon={<img src={ isDarkMode ? sidebarIcon : sidebarIconBlack } alt='Sidebar Icon'></img>}
              title={<span>Simple Recipes</span>}
              content={[
                  <div onClick={ () => { setSidebarOption("about") } }>About</div>,
                  <div onClick={ () => { setSidebarOption("new") } }>New Recipe</div>,
                  <div onClick={ () => { setSidebarOption("browse") } }>Browse Recipes</div>,
                  <div onClick={ () => { setSidebarOption("search") } }>Recipe Search</div>,
                  <a href='https://github.com/azrinsler/cloud-resume/tree/main/cookbook'>GitHub</a>,
                  <div onClick={ () => { setSidebarOption("donate") } }
                       onMouseEnter={ () => { setSidebarOption("jokes") } }>
                      { sidebarOption == "jokes" ? <>Don't</> : <>Donate</> }
                  </div>
              ]}
          >
          </Sidebar>
          <div className='flex-column' style={{width:'100%',placeContent:'center',placeItems:'center',padding:'1em'}}>
              {
                  error ? <p>Error: {error}</p> : <></>
              }
              {
                  loading
                      ? <span>Preheating</span>

                  : sidebarOption == "about"
                      ? <About></About>

                  : sidebarOption == "browse"
                      ? <Browse></Browse>

                  : <RecipeCard
                      title={data.title}
                      ingredients={data.ingredients}
                      items={data.items}
                      steps={data.steps}>
                  </RecipeCard>
              }
          </div>
      </>
  )
}


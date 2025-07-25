import RecipeCard  from "./components/RecipeCard.tsx";
import testRecipeJson from './json/test/test-recipe.json' with { type : 'json' }
import Sidebar from "./components/Sidebar.tsx";
import sidebarIcon from './assets/cookbook-icon.svg'
import sidebarIconBlack from './assets/cookbook-icon-black.svg'
import {useCallback, useEffect, useState} from "react";
import type {Recipe} from "./interfaces/Recipe.ts";
import About from "./components/about/About.tsx";
import Browse from "./components/Browse.tsx";
import Preheating from "./components/Preheating.tsx";
import NewRecipe from "./components/NewRecipe.tsx";

const testRecipe = testRecipeJson as Recipe

export function App() {
    // we'll try caching a few of these in local storage as well, so if the user reloads they don't lose their place
    const [recipeId, setRecipeId] = useState( localStorage.getItem("recipeId") || "0")
    const [sidebarOption, setSidebarOption] = useState( localStorage.getItem("sidebarOption") || "about" )
    const [jokeOption, setJokeOption] = useState("")
    const [data, setData] = useState(testRecipe);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // sets current mode based on user preference and adds a listener in case they change their mind
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const [isDarkMode, setDarkMode] = useState(prefersDarkMode)
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
        setDarkMode(event.matches)
    });

    const fetchRecipe = useCallback((recipe: string) => {
        console.log("cacheRecipe(" + recipe + ")")
        setRecipeId(recipe)
        localStorage.setItem("recipeId", recipe)
        fetch("https://api.azrinsler.com/RecipeApiLambda", {
            signal: AbortSignal.timeout(120 * 1000),
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                "operation": "searchById",
                "recipeId": recipe
            })
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then((json) => {
            if (json != null) {
                const jsonData = json as Recipe;
                setData(jsonData);
                console.log(jsonData);
                setLoading(false);
                setSidebarOption("recipe");
                localStorage.setItem("sidebarOption", "recipe")
            }
        })
        .catch((err) => {
            setError(err.message);
            setLoading(false)
        });
    }, []);

    // I think this should set loading to true and cache our recipe id any time it changes?
    useEffect(() => {
        setLoading(true)
        localStorage.setItem("recipeId", recipeId)
    }, [recipeId]);

    // Also cache sidebarOption in local storage in the same way
    useEffect(() => {
        localStorage.setItem("sidebarOption", sidebarOption)
    }, [sidebarOption]);

    useEffect(() => {
        // this calls a Lambda which has a cold start time and may need a few seconds if it hasn't been used recently
        if (loading && sidebarOption == 'recipe') {
            fetchRecipe(recipeId);
        }
    }, [fetchRecipe, loading, recipeId, sidebarOption]);


    return (
      <>
          <Sidebar
              icon={<img src={ isDarkMode ? sidebarIcon : sidebarIconBlack } alt='Sidebar Icon'></img>}
              title={<span>Simple Recipes</span>}
              content={[
                  <div onClick={ () => { setSidebarOption("about") } }>About</div>,
                  <div onClick={ () => { setSidebarOption("new") } }>New Recipe</div>,
                  <div onClick={ () => { setSidebarOption("browse") } }>Browse Recipes</div>,
                  <div onClick={ () => { setSidebarOption("recipe") } }>Current Recipe</div>,
                  <a href='https://github.com/azrinsler/cloud-resume/tree/main/cookbook'>GitHub</a>,
                  <div onMouseLeave={ () => { setJokeOption("") } }
                       onMouseEnter={ () => { setJokeOption("donate") } }>
                      { jokeOption == "donate" ? <>Don't</> : <>Donate</> }
                  </div>
              ]}
          >
          </Sidebar>
          <div className='flex-column' style={{flexGrow:'1', overflow:'hidden', maxHeight:'100vh'}}>
              {
                  sidebarOption == "about"
                      ? <About></About>
                  : sidebarOption == "new"
                      ? <NewRecipe></NewRecipe>
                  : sidebarOption == "browse"
                      ? <Browse recipeCallback={fetchRecipe}></Browse>
                  : sidebarOption == "recipe" && loading
                      ? <Preheating></Preheating>
                  : sidebarOption == "recipe"
                      ? <>
                          { error ? <><p style={{color:'red'}}>{error}</p><p style={{color:'darkgoldenrod'}}>Example Recipe:</p></> : <></> }
                          <RecipeCard
                              title={data?.title}
                              ingredients={data?.ingredients}
                              items={data?.items}
                              steps={data?.steps}>
                          </RecipeCard>
                        </>
                  : <>Unknown Sidebar Option</>
              }
              <div style={{width:'100%',textAlign:'center',color:'red',position:'sticky',bottom:'0'}}>
                  IMPORTANT: Please note that this is a DEV environment - new recipes may be lost any time the DB changes!
              </div>
          </div>
      </>
  )
}


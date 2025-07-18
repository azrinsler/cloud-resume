import RecipeCard  from "./components/RecipeCard.tsx";
import testRecipeJson from './json/test-recipe.json' with { type : 'json' }
import Sidebar from "./components/Sidebar.tsx";
import sidebarIcon from './assets/cookbook-icon.svg'
import sidebarIconBlack from './assets/cookbook-icon-black.svg'
import {useCallback, useEffect, useState} from "react";
import type {Recipe} from "./interfaces/Recipe.ts";
import About from "./components/About.tsx";
import Browse from "./components/Browse.tsx";


const testRecipe = testRecipeJson as Recipe

export function App() {
    const [recipeId, setRecipeId] = useState("0")
    const [sidebarOption, setSidebarOption] = useState("about")
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

    const cacheRecipe = useCallback((recipe: string) => {
        console.log("cacheRecipe(" + recipe + ")")
        setRecipeId(recipe)
        fetch("https://api.azrinsler.com/RecipeLambda", {
            signal: AbortSignal.timeout(120 * 1000),
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                "operation": "searchById",
                "recipeId": recipeId
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
            }
        })
        .catch((err) => {
            setError(err.message);
            setLoading(false)
        });
    }, [recipeId]);

    // I think this should set loading to true any time the recipe id changes?
    useEffect(() => {
        setLoading(true)
    }, [recipeId]);

    useEffect(() => {
        // this calls a Lambda which has a cold start time and may need a few seconds if it hasn't been used recently
        if (loading) {
            cacheRecipe(recipeId);
//         fetch("https://api.azrinsler.com/RecipeLambda", {
//             signal: AbortSignal.timeout(120 * 1000),
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//                 "Access-Control-Allow-Origin": "https://api.azrinsler.com/RecipeLambda"
//             }, // recipe 0 is a test recipe for stovetop rice... about as basic as it gets
//             body: JSON.stringify({ "operation":"searchById","recipeId":"0" })
//         })
//         .then((response) => {
//             if (!response.ok) {
//                 throw new Error('Network response was not ok');
//             }
//             return response.json();
//         })
//         .then((json) => {
//             if (json != null) {
//                 const jsonData = json as Recipe;
//                 setData(jsonData);
//                 console.log(jsonData);
//                 setLoading(false);
//                 setSidebarOption("recipe");
//             }
//         })
//         .catch((err) => {
//             setError(err.message);
//             setLoading(false);
//         });

        }
//  }, [data, loading] );
    }, [cacheRecipe, loading, recipeId]);


    return (
      <>
          <Sidebar
              icon={<img src={ isDarkMode ? sidebarIcon : sidebarIconBlack } alt='Sidebar Icon'></img>}
              title={<span>Simple Recipes</span>}
              content={[
                  <div onClick={ () => { setSidebarOption("about") } }>About</div>,
                  // <div onClick={ () => { setSidebarOption("new") } }>New Recipe</div>,
                  <div onClick={ () => { setRecipeId("0") } }>New Recipe</div>,
                  <div onClick={ () => { setSidebarOption("browse") } }>Browse Recipes</div>,
                  // <div onClick={ () => { setSidebarOption("search") } }>Recipe Search</div>,
                  <div onClick={ () => { setRecipeId("1") } }>Recipe Search</div>,
                  <a href='https://github.com/azrinsler/cloud-resume/tree/main/cookbook'>GitHub</a>,
                  <div onMouseLeave={ () => { setJokeOption("") } }
                       onMouseEnter={ () => { setJokeOption("donate") } }>
                      { jokeOption == "donate" ? <>Don't</> : <>Donate</> }
                  </div>
              ]}
          >
          </Sidebar>
          <div className='flex-column' style={{width:'100%',placeContent:'center',placeItems:'center',padding:'1em'}}>
              {
                  loading
                      ? <span>Preheating</span>
                  : sidebarOption == "about"
                      ? <About></About>
                  : sidebarOption == "browse"
                      ? <Browse recipeCallback={cacheRecipe}></Browse>
                  : <div>
                        { error ? <p>Error: {error}</p> : <></> }
                        <RecipeCard
                              title={data.title}
                              ingredients={data.ingredients}
                              items={data.items}
                              steps={data.steps}>
                        </RecipeCard>
                  </div>
              }
          </div>
      </>
  )
}


import { RecipeCard } from "./components/RecipeCard.tsx";
import testRecipeJson from './json/test-recipe.json' with { type : 'json' }
import Sidebar from "./components/Sidebar.tsx";
import sidebarIcon from './assets/react.svg'

// @ts-expect-error // leave me alone about the namespace holy shit
const testRecipe = testRecipeJson as RecipeCard.Recipe

export function App() {
  return (
      <>
          <Sidebar
              icon={<img src={sidebarIcon} alt='Sidebar Icon'></img>}
              title={<span>Title</span>}
              content={[
                  <div>hello world</div>,
                  <div>two lorem</div>
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


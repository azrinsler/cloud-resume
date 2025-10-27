resource "aws_dynamodb_table" "recipes_table" {
  name           = "Recipes"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "recipe_id"

  attribute {
    name = "recipe_id"
    type = "S"
  }

  # GSI uses 'email' as a new partition key
  attribute {
    name = "title"
    type = "S"
  }

  global_secondary_index {
    name               = "title-index"
    hash_key           = "title"
    projection_type    = "ALL"  # or KEYS_ONLY or INCLUDE
  }

  # purposefully underpowered for development
  on_demand_throughput {
    max_read_request_units = 1
    max_write_request_units = 1
  }
}

# pre-populate the new table with a single item so it isn't completely empty
resource "aws_dynamodb_table_item" "stovetop_rice" {
  table_name = aws_dynamodb_table.recipes_table.name
  hash_key   = aws_dynamodb_table.recipes_table.hash_key

  item =  <<ITEM
          {
            "recipe_id": {"S": "6d5c2a9c-7519-4ab6-a0c6-d3ed1c1a0f60"},
            "title": {"S": "Stovetop Rice"},
            "user": {"S": "04d88438-e021-706c-ae4c-5479c6f143eb"},
            "ingredients": {"L": [
              {"M": { "name":{"S":"Rice"}, "unit":{"S":"Cup"}, "amount":{"S":"1"} } },
              {"M": { "name":{"S":"Water"}, "unit":{"S":"Cups"}, "amount":{"S":"2"} } }
            ] },
            "items": {"L": [{"S":"Medium Pot w/ Lid"}, {"S":"Something to stir with"}] },
            "steps": {"L": [
              {"M": { "ordinal":{"N":"0"}, "description":{"S":"Bring rice and water to a low boil over medium-high heat."} } },
              {"M": { "ordinal":{"N":"1"}, "description":{"S":"Reduce heat to low and wait roughly 20 minutes or until all water is absorbed."} } },
              {"M": { "ordinal":{"N":"2"}, "description":{"S":"Turn off heat, stir rice, re-cover, and wait and additional 10 minutes."}, "notes":{"L":[{"S":"Fluff rice before serving."}]} } }
            ] }
          }
          ITEM
}

resource "aws_dynamodb_table_item" "ranch_sauce" {
  table_name = aws_dynamodb_table.recipes_table.name
  hash_key   = aws_dynamodb_table.recipes_table.hash_key

  item =  <<ITEM
          {
            "recipe_id": {"S": "532ae1a4-54a5-4a0e-8219-77f5c440a2a3"},
            "title": {"S": "Ranch"},
            "user": {"S": "04d88438-e021-706c-ae4c-5479c6f143eb"},
            "ingredients": {"L": [
              {"M": { "name":{"S":"Sour Cream"}, "unit":{"S":"Cups"}, "amount":{"S":"1 1/2"} } },
              {"M": { "name":{"S":"Mayonnaise"}, "unit":{"S":"Cup"}, "amount":{"S":"1/2"} } },
              {"M": { "name":{"S":"Dried Dill Weed"}, "unit":{"S":"tsp."}, "amount":{"S":"1 1/2"} } },
              {"M": { "name":{"S":"Dried Parsely"}, "unit":{"S":"tsp."}, "amount":{"S":"1"} } },
              {"M": { "name":{"S":"Onion Powder"}, "unit":{"S":"tsp."}, "amount":{"S":"1/2"} } },
              {"M": { "name":{"S":"Garlic Powder"}, "unit":{"S":"tsp."}, "amount":{"S":"1/2"} } },
              {"M": { "name":{"S":"Salt"}, "unit":{"S":"tsp."}, "amount":{"S":"1/2"} } },
              {"M": { "name":{"S":"Black Pepper"}, "unit":{"S":"tsp."}, "amount":{"S":"1/2"} } },
              {"M": { "name":{"S":"Fresh Chives"}, "unit":{"S":""}, "amount":{"S":"yes"} } },
              {"M": { "name":{"S":"(optional) Ghost Pepper Powder"}, "unit":{"S":"tsp."}, "amount":{"S":"1/4"} } }
            ] },
            "items": {"L": [{"S":"Container w/ Lid"}, {"S":"Something to stir with"}] },
            "steps": {"L": [
              {"M": { "ordinal":{"N":"1"}, "description":{"S":"Mix all the things together in the container."}, "notes":{"L":[{"S":"Use freshly cracked/ground peppercorn if possible - it is stronger."}]} } },
              {"M": { "ordinal":{"N":"2"}, "description":{"S":"Cover and chill for at least 20 minutes."}, "notes":{"L":[{"S":"Flavor may take several hours to fully develop."}]} } }
            ] }
          }
          ITEM
}
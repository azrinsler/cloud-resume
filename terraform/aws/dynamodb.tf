resource "aws_dynamodb_table" "site_visitor_table" {
  name           = "SiteVisitors"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "ip_address"

  attribute {
    name = "ip_address"
    type = "S"
  }

  # purposefully underpowered for development
  on_demand_throughput {
    max_read_request_units = 1
    max_write_request_units = 1
  }
}

# pre-populate the new table with a single item so it isn't completely empty
resource "aws_dynamodb_table_item" "loopback_ip" {
  table_name = aws_dynamodb_table.site_visitor_table.name
  hash_key   = aws_dynamodb_table.site_visitor_table.hash_key

  item =  <<ITEM
          {
            "ip_address": {"S": "192.168.1.1"},
            "visit_counter": {"N": "1" }
          }
          ITEM
}

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
            "recipe_id": {"S": "0"},
            "title": {"S": "Stovetop Rice" },
            "ingredients": {"L": [
              {"M": { "name":{"S":"Rice"}, "unit":{"S":"Cup"}, "amount":{"N":"1"} } },
              {"M": { "name":{"S":"Water"}, "unit":{"S":"Cups"}, "amount":{"N":"2"} } }
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
            "recipe_id": {"S": "1"},
            "title": {"S": "Ranch Sauce" },
            "ingredients": {"L": [
              {"M": { "name":{"S":"Sour Cream"}, "unit":{"S":"Cup"}, "amount":{"N":"1"} } },
              {"M": { "name":{"S":"Mayonnaise"}, "unit":{"S":"Cup"}, "amount":{"N":"0.5"} } },
              {"M": { "name":{"S":"Dried Dill Weed"}, "unit":{"S":"tsp."}, "amount":{"N":"1"} } },
              {"M": { "name":{"S":"Dried Parsely"}, "unit":{"S":"tsp."}, "amount":{"N":"0.5"} } },
              {"M": { "name":{"S":"Granulated Onion"}, "unit":{"S":"tsp."}, "amount":{"N":"0.25"} } },
              {"M": { "name":{"S":"Granulated Garlic"}, "unit":{"S":"tsp."}, "amount":{"N":"0.25"} } },
              {"M": { "name":{"S":"Fresh Garlic"}, "unit":{"S":"tsp."}, "amount":{"N":"0.5"} } },
              {"M": { "name":{"S":"Salt"}, "unit":{"S":"tsp."}, "amount":{"N":"0.25"} } },
              {"M": { "name":{"S":"Black Pepper"}, "unit":{"S":"tsp."}, "amount":{"N":"0.25"} } },
              {"M": { "name":{"S":"Chives"}, "unit":{"S":"tsp."}, "amount":{"N":"1"} } }
            ] },
            "items": {"L": [{"S":"Container w/ Lid"}, {"S":"Something to stir with"}] },
            "steps": {"L": [
              {"M": { "ordinal":{"N":"0"}, "description":{"S":"Mince or crush the fresh garlic."} } },
              {"M": { "ordinal":{"N":"1"}, "description":{"S":"Mix all the things together in the container."}, "notes":{"L":[{"S":"Use freshly cracked/ground peppercorn if possible - it is stronger than black pepper."}]} } },
              {"M": { "ordinal":{"N":"2"}, "description":{"S":"Cover and chill for at least 1-2 hours."}, "notes":{"L":[{"S":"Flavor will continue to develop over time."}]} } }
            ] }
          }
          ITEM
}
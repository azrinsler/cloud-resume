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
            "ip_address": {"S": "192.168.1.1"}
          }
          ITEM
}

terraform {
  backend "s3" {
    bucket         = "terra"
    key            = "prod/terraform.tfstate"
    region         = "eu-west-1"
    dynamodb_table = "terra"
    encrypt        = true
  }
}
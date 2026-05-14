
# Dropship System (Minimal Stable Loop)

## Install
npm install

## Run
npm start

## Use

Create job:
POST /job
{
  "product": {
    "title": "Test Product",
    "description": "Example product",
    "price": "£10"
  }
}

Then open:
http://localhost:3000/products/1.html

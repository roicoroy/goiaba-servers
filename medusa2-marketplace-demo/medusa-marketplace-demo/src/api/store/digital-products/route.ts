import {
  MedusaRequest,
  MedusaResponse
} from "@medusajs/framework"
import {
  DIGITAL_PRODUCT_MODULE
} from "../../../modules/digital-product"
import DigitalProductModuleService from "../../../modules/digital-product/service"

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const digitalProductModuleService: DigitalProductModuleService = 
    req.scope.resolve(
      DIGITAL_PRODUCT_MODULE
    )

  const digitalProducts = await digitalProductModuleService.listDigitalProducts(
    req.query
  )

  res.json({
    digital_products: digitalProducts
  })
}
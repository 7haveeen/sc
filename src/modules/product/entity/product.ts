import {
  Entity,
  Filter,
  ForbiddenError,
  Relations,
  remult,
  repo,
} from "remult";
import { vFields } from "@/utils/fields";
import { UIPermissions } from "@/services/iam";
import { Shop } from "$modules/org";
import * as v from "valibot";

export const productDto = v.object({
  id: v.optional(v.string()),
  name: v.pipe(v.string(), v.minLength(2)),
  price: v.number(),
  description: v.optional(v.string()),
  categoryId: v.optional(v.string()),
  businessId: v.string(),
  shopId: v.string(),
  isPublished: v.optional(v.boolean()),
  createdAt: v.optional(v.date()),
  updatedAt: v.optional(v.date()),
});

@Entity<Product>("product", {
  allowApiRead: true,
  allowApiUpdate: true,
  allowApiDelete: true,
  backendPrefilter: () => Product.filter(),
})
export class Product {
  @vFields.cuid()
  id!: string;

  @vFields.string({
    input: productDto.entries.name,
  })
  name!: string;

  @vFields.integer({
    input: productDto.entries.price,
  })
  price!: number;

  @vFields.string({
    input: productDto.entries.description,
  })
  description?: string;

  @vFields.string({
    input: productDto.entries.categoryId,
  })
  categoryId?: string;

  @vFields.string({
    input: productDto.entries.businessId,
  })
  businessId!: string;

  @vFields.string({
    input: productDto.entries.shopId,
  })
  shopId!: string;

  @Relations.toOne(() => Shop, "shopId")
  shop?: Shop;

  @vFields.boolean({
    defaultValue: () => false,
    input: productDto.entries.isPublished,
  })
  isPublished!: boolean;

  @vFields.createdAt()
  createdAt!: Date;

  @vFields.updatedAt()
  updatedAt?: Date;

  static filter = Filter.createCustom<Product>(async () => {
    const user = remult.user;
    if (!user) {
      throw new ForbiddenError("Unauthorized");
    }

    return {
      // publicId: { $in: shopIds },
    };
  });
}

export const productRepo = repo(Product);
export const hasProductPerm = UIPermissions<Product>(productRepo);

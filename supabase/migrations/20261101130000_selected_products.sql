-- Adds products we buy from brands and ship ourselves, which aren't made by us.
alter table public.products
  drop constraint if exists products_product_type_check,
  add constraint products_product_type_check
    check (product_type in ('crafted', 'selected', 'promoted'));

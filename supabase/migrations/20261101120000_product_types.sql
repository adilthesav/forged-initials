-- Separates products we craft from products we promote through affiliate links.
-- Every existing product stays 'crafted'.
alter table public.products
  add column if not exists product_type text not null default 'crafted',
  add column if not exists affiliate_url text;

alter table public.products
  drop constraint if exists products_product_type_check,
  add constraint products_product_type_check
    check (product_type in ('crafted', 'promoted'));

alter table public.products
  drop constraint if exists products_promoted_link_check,
  add constraint products_promoted_link_check
    check (product_type <> 'promoted' or affiliate_url like 'https://%');

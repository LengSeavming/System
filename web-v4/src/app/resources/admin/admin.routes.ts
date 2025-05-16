import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProductComponent } from './product/product.component';
import { ProductsTypeComponent } from './product/type/type.component';
import { SaleComponent } from './sale/sale.component';
import { UserComponent } from './user/listing/component';
import { PetComponent } from './pet/pet.component';
import { PetTypeComponent } from './pet/type/pet_type.component';

export default [
    {
        path: 'dashboard',
        component: DashboardComponent,
    },
    {
        path: 'pos',
        component: SaleComponent,
    },
    {
        path: 'product',
        children: [
            {
                path: 'all',
                component: ProductComponent,
            },
            {
                path: 'type',
                component: ProductsTypeComponent,
            },
        ],
    },
    {
        path: 'pet',
        children: [
            {
                path: 'all',
                component: PetComponent,
            },
            {
                path: 'type',
                component: PetTypeComponent,
            },
        ],
    },
    {
        path: 'users',
        component: UserComponent,
    },
] as Routes;

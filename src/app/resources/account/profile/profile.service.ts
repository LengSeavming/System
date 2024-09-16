// ================================================================>> Core Library
import { Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';

// ================================================================>> Costom Library
import { FileService } from 'src/app/services/file.service';

@Injectable()
export class ProfileService {

    constructor(
        private readonly fileService: FileService,
        private readonly sequelize: Sequelize,
    ) { };

    public async testRawQuery() {
        const rawQuery = `
            SELECT 
                u.id, 
                u.name, 
                u.avatar, 
                u.phone,
                u.sex_id, 
                s.name as sex_name
            FROM 
                "user" u
            LEFT JOIN 
                "sex" s 
            ON 
                u.sex_id = s.id
        `;
        const [results] = await this.sequelize.query(rawQuery);
        // Transform the results to include nested sex object
        const transformedResults = results.map((user: any) => ({
            id: user.id,
            name: user.name,
            avatar: user.avatar,
            phone: user.phone,
            sex: {
                id: user.sex_id,
                name: user.sex_name
            }
        }));
        return transformedResults;
    }
}

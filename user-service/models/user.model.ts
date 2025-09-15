import { Table, Column, Model, DataType } from 'sequelize-typescript';
import { Optional } from 'sequelize';

interface UserAttributes {
    id: string;
    name: string;
    email: string;
    created_at: Date;
    updated_at: Date;
    deleted_at?: Date | null;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'created_at' | 'updated_at' | 'deleted_at'> {}

@Table({ tableName: 'users', paranoid: true, timestamps: true, underscored: true })
export class User extends Model<UserAttributes, UserCreationAttributes> {
    @Column({
        type: DataType.UUID,
        primaryKey: true,
        defaultValue: DataType.UUIDV4,
    })
    declare id: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare name: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        unique: true,
    })
    declare email: string;
}
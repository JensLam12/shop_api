import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImage } from "./product-image.entity";
import { User } from "src/auth/entities/user.entity";
import { ApiProperty } from "@nestjs/swagger";

@Entity({ name: 'product'})
export class Product {

    @ApiProperty({
        example: '0044ecb6-7e0e-4e9a-aad3-f154027f8718',
        description: 'Product ID',
        uniqueItems: true
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({
        example: "Men's 3D T Logo Tee",
        description: 'Title',
        uniqueItems: true
    })
    @Column('text', {
        unique: true
    })
    title: string;

    @ApiProperty({
        example: 35,
        description: 'Price',
        default: 0
    })
    @Column('float', {
        default: 0
    })
    price: number;

    @ApiProperty({
        example: 'Designed for fit, comfort and style',
        description: 'Description',
        default: ''
    })
    @Column({
        type: 'text',
        nullable: true
    })
    description: string;

    @ApiProperty({
        example: 'men_3d_t_logo_tee',
        description: 'Slug',
        default: ''
    })
    @Column('text', {
        unique: true
    })
    slug: string;

    @ApiProperty({
        example: 5,
        description: 'Stock',
        default: 0
    })
    @Column('int', {
        default: 0
    })
    stock: number;

    @ApiProperty({
        example: ["XS", "S"],
        description: 'Sizes',
        default: []
    })
    @Column('text', {
        array: true
    })
    sizes: string[];

    @ApiProperty({
        example: "men",
        description: 'Gender',
        default: 0
    })
    @Column('text')
    gender: string;

    @ApiProperty({
        example: ["shirt"],
        description: 'Tags',
        default: []
    })
    @Column('text',{
        array: true,
        default: []
    })
    tags: string[]

    @ApiProperty()
    @ManyToOne(
        () => User,
        ( user ) => user.product,
        { eager: true }
    )
    user: User;

    @ApiProperty()
    @OneToMany(
        ()=> ProductImage,
        (productImage) => productImage.product,
        { cascade: true, eager: true }
    )
    images?: ProductImage[]

    @BeforeInsert()
    checkSlugInsert() {
        if( !this.slug ) {
            this.slug = this.title;
        }

        this.slug = this.slug
            .toLowerCase()
            .replaceAll(" ", "_")
            .replaceAll("'", " ")
    }

    @BeforeUpdate()
    checkSlugUpdate() {
        this.slug = this.slug
            .toLowerCase()
            .replaceAll(" ", "_")
            .replaceAll("'", " ")
    }
}

import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { validate as isUUID } from 'uuid';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductsService');
  
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>
  ) {}

  async create(createProductDto: CreateProductDto) {
    try {
      const product = this.productRepository.create( createProductDto);
      await this.productRepository.save( product);
      return product;

    } catch( exception ) {
      this.handleExceptions(exception);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    try {
      const { limit = 2, offset = 0 } = paginationDto;
      const products = await this.productRepository.find({
        take: limit,
        skip: offset
      });
      return products;
    }catch(exception) {
      this.handleExceptions(exception);
    }
  }

  async findOne(term: string) {
    try {
      let product: Product;
      if( isUUID(term) ) {
        product = await this.productRepository.findOneBy({ id: term });
      } else {
        // product = await this.productRepository.findOneBy({ slug: term });
        const queryBuilder = this.productRepository.createQueryBuilder();
        product = await queryBuilder
          .where( 'UPPER(title)=:title or slug=:slug', {
            title: term.toUpperCase(),
            slug: term.toLowerCase()
          }).getOne();
      }

      if(!product)
        throw new NotFoundException(`Product with term ${term} not found`);

      return product;
    } catch(exception) {
      this.handleExceptions(exception);
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto) {

    const product = await this.productRepository.preload({
      id: id,
      ...updateProductDto
    });

    if( !product ) throw new NotFoundException(`Product with id: ${id} not found`);

    try {
      await this.productRepository.save( product);
      return product;
    } catch( exception ) {
      this.handleExceptions(exception);
    }
  }

  async remove(id: string) {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }

  private handleExceptions( error: any ) {
    if( error.code === '23505') {
      throw new BadRequestException( error.detail);
    }
    this.logger.error(error);
    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}

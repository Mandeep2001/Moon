import express from 'express';

import {
  Controller,
  RequestWithPagination,
  RequestWithUser,
} from '../interfaces';
import { PostServiceInterface } from '../services/post.service';
import { isAuthenticated, paginate } from '../middlewares';
import { CreatePostDto, UpdatePostDto } from '../dtos/post';
import { BadRequestException } from '../exceptions';

class PostsController implements Controller {
  private path = '/posts';
  public router = express.Router();

  constructor(private postService: PostServiceInterface) {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(`${this.path}`, isAuthenticated, paginate, this.getPosts);
    this.router.get(`${this.path}/:id`, isAuthenticated, this.getPostById);
    this.router.post(`${this.path}`, isAuthenticated, this.createPost);
    this.router.patch(`${this.path}/:id`, isAuthenticated, this.updatePost);
    this.router.delete(`${this.path}/:id`, isAuthenticated, this.deletePost);
  }

  private getPosts = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ): Promise<express.Response | void> => {
    try {
      const posts = await this.postService.getPosts(
        (req as RequestWithPagination).pagination,
      );
      return res.json(posts);
    } catch (error) {
      return next(error);
    }
  };

  private getPostById = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ): Promise<express.Response | void> => {
    const postId = req.params.id;

    try {
      const post = await this.postService.getPostById(postId);
      return res.json(post);
    } catch (error) {
      return next(error);
    }
  };

  private createPost = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ): Promise<express.Response | void> => {
    const createPostDto: CreatePostDto = req.body;
    const user = (req as RequestWithUser).user;

    try {
      const post = await this.postService.createPost(user._id, createPostDto);
      return res.json(post);
    } catch (error) {
      return next(error);
    }
  };

  private updatePost = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ): Promise<express.Response | void> => {
    const postId = req.params.id;
    const updatePostDto: UpdatePostDto = req.body;
    const user = (req as RequestWithUser).user;

    try {
      const post = await this.postService.updatePost(
        user._id,
        postId,
        updatePostDto,
      );
      return res.json(post);
    } catch (error) {
      return next(error);
    }
  };

  private deletePost = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ): Promise<express.Response | void> => {
    const postId = req.params.id;
    const user = (req as RequestWithUser).user;

    try {
      const result = await this.postService.deletePost(user._id, postId);
      if (!result) {
        throw new BadRequestException();
      }

      return res.status(204).json(result);
    } catch (error) {
      return next(error);
    }
  };
}

export default PostsController;

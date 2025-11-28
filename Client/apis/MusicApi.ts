// client/lib/src/apis/MusicApi.ts

import { request } from '../http/httpClient';
import type {
  Music,
  MusicCreateRequest,
  MusicUpdateRequest,
  MusicUpdateWithoutFilesRequest,
  MusicSearchParams,
} from '../types/music';

/**
 * 音乐API类
 * 提供音乐相关的所有接口调用方法
 * 
 * @example
 * ```typescript
 * const musicApi = new MusicApi();
 * 
 * // 获取所有音乐
 * const musicList = await musicApi.getAll();
 * 
 * // 添加音乐
 * const newMusic = await musicApi.add({
 *   title: '示例歌曲',
 *   artist: '示例歌手',
 *   fileData: base64AudioData,
 *   mimeType: 'audio/mpeg'
 * });
 * ```
 */
export class MusicApi {
  /**
   * 根据ID获取音乐信息
   * 
   * @param musicId - 音乐ID
   * @returns 音乐详细信息
   * 
   * @example
   * ```typescript
   * const music = await musicApi.getById(1);
   * console.log(music.title);
   * ```
   */
  getById(musicId: number): Promise<Music> {
    return request<Music>('GET', `/api/music/${musicId}`);
  }

  /**
   * 获取所有音乐列表
   * 
   * @returns 音乐列表(按创建时间倒序)
   * 
   * @example
   * ```typescript
   * const musicList = await musicApi.getAll();
   * console.log(`共${musicList.length}首音乐`);
   * ```
   */
  getAll(): Promise<Music[]> {
    return request<Music[]>('GET', '/api/music');
  }

  /**
   * 根据分类获取音乐列表
   * 
   * @param category - 分类名称
   * @returns 该分类下的音乐列表
   * 
   * @example
   * ```typescript
   * const popMusic = await musicApi.getByCategory('流行');
   * ```
   */
  getByCategory(category: string): Promise<Music[]> {
    return request<Music[]>('GET', `/api/music/category/${encodeURIComponent(category)}`);
  }

  /**
   * 根据艺术家获取音乐列表
   * 
   * @param artist - 艺术家名称(支持模糊匹配)
   * @returns 该艺术家的音乐列表
   * 
   * @example
   * ```typescript
   * const artistMusic = await musicApi.getByArtist('周杰伦');
   * ```
   */
  getByArtist(artist: string): Promise<Music[]> {
    return request<Music[]>('GET', `/api/music/artist/${encodeURIComponent(artist)}`);
  }

  /**
   * 搜索音乐
   * 在标题和艺术家中进行模糊搜索
   * 
   * @param params - 搜索参数
   * @returns 匹配的音乐列表
   * 
   * @example
   * ```typescript
   * const results = await musicApi.search({ keyword: '晴天' });
   * ```
   */
  search(params: MusicSearchParams): Promise<Music[]> {
    return request<Music[]>('GET', '/api/music/search', {
      params: { keyword: params.keyword }
    });
  }

  /**
   * 添加新音乐
   * 
   * @param music - 音乐信息(必须包含title, fileData, fileSize, mimeType)
   * @returns 添加成功后的音乐信息(包含生成的musicId)
   * 
   * @example
   * ```typescript
   * const audioFile = new Uint8Array(...); // 音乐文件数据
   * const base64AudioData = btoa(String.fromCharCode(...audioFile));
   * 
   * const newMusic = await musicApi.add({
   *   title: '新歌',
   *   artist: '歌手',
   *   category: '流行',
   *   fileData: base64AudioData,
   *   fileSize: audioFile.length,  // 必填
   *   mimeType: 'audio/mpeg',
   *   coverImage: base64ImageData,
   *   tags: ['热门', '新歌'],
   *   moodTags: ['快乐', '轻松']
   * });
   * console.log('音乐ID:', newMusic.musicId);
   * ```
   */
  add(music: MusicCreateRequest): Promise<Music> {
    return request<Music>('POST', '/api/music', { body: music });
  }

  /**
   * 更新音乐信息(包含文件数据)
   * 
   * @param musicId - 音乐ID
   * @param music - 要更新的音乐信息
   * @returns Promise<void>
   * 
   * @example
   * ```typescript
   * await musicApi.update(1, {
   *   title: '更新后的标题',
   *   fileData: newBase64AudioData,
   *   mimeType: 'audio/mpeg'
   * });
   * ```
   */
  update(musicId: number, music: MusicUpdateRequest): Promise<void> {
    return request<void>('PUT', `/api/music/${musicId}`, { body: music });
  }

  /**
   * 更新音乐信息(不包含文件数据和封面)
   * 用于更新元数据,不修改音乐文件本身
   * 
   * @param musicId - 音乐ID
   * @param music - 要更新的音乐信息
   * @returns Promise<void>
   * 
   * @example
   * ```typescript
   * await musicApi.updateWithoutFiles(1, {
   *   title: '修改标题',
   *   artist: '修改艺术家',
   *   lyrics: '更新歌词'
   * });
   * ```
   */
  updateWithoutFiles(musicId: number, music: MusicUpdateWithoutFilesRequest): Promise<void> {
    return request<void>('PATCH', `/api/music/${musicId}`, { body: music });
  }

  /**
   * 删除音乐
   * 
   * @param musicId - 音乐ID
   * @returns Promise<void>
   * 
   * @example
   * ```typescript
   * await musicApi.delete(1);
   * console.log('音乐已删除');
   * ```
   */
  delete(musicId: number): Promise<void> {
    return request<void>('DELETE', `/api/music/${musicId}`);
  }

  /**
   * 获取音乐总数
   * 
   * @returns 音乐总数
   * 
   * @example
   * ```typescript
   * const count = await musicApi.getCount();
   * console.log(`共有${count}首音乐`);
   * ```
   */
  getCount(): Promise<number> {
    return request<number>('GET', '/api/music/count');
  }

  /**
   * 根据分类获取音乐数量
   * 
   * @param category - 分类名称
   * @returns 该分类下的音乐数量
   * 
   * @example
   * ```typescript
   * const count = await musicApi.getCountByCategory('流行');
   * console.log(`流行音乐共${count}首`);
   * ```
   */
  getCountByCategory(category: string): Promise<number> {
    return request<number>('GET', `/api/music/count/category/${encodeURIComponent(category)}`);
  }

  /**
   * 获取所有音乐元数据(不包含文件内容)
   * 
   * @returns 音乐列表(不含文件数据)
   * 
   * @example
   * ```typescript
   * const musicList = await musicApi.getAllMetadata();
   * console.log(`共${musicList.length}首音乐`);
   * ```
   */
  getAllMetadata(): Promise<Music[]> {
    return request<Music[]>('GET', '/api/music/metadata');
  }
}

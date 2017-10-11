from PIL import Image, ImageColor
import json, os, sys
import glob
import moviepy.editor as mpy
import shutil

class GIF_maker:
    def __init__(self, input_name, output_name):
        '''
        Get config 
        '''

        print('Getting config...')

        with open('./gif_config.json') as fp:
            self.config = json.load(fp)

        self.input_name = input_name
        self.output_name = output_name

    def __load_frame_data(self):
        '''
        Get JSON data saved by server
        Each line is a list of pixel diffs
        '''

        print('Loading frame data...')

        frames = []
        with open(self.input_name, 'r') as input:
            line = input.readline()

            while line:
                j_dict = json.loads(line)
                frames.append(j_dict)
                line = input.readline()

        self.frame_data = frames

    def __create_image_frames(self):
        '''
        Output create a PNG file in a tmp directory
        for each line of our input JSON data
        '''

        print('Generating image frames...')

        input_dim = (self.config['INPUT_WIDTH'], self.config['INPUT_HEIGHT'])
        scale = self.config['SCALE']
        output_dim = (input_dim[0] * scale, input_dim[1] * scale)

        self.current_frame = Image.new('RGB', input_dim, self.config['BG_COLOR'])

        os.makedirs('./tmp')

        i = 0
        for diffs in self.frame_data:
            self.__draw_next_image(diffs)

            output_frame = self.current_frame.copy()
            output_frame = output_frame.resize(output_dim, Image.NEAREST)
            output_frame.save('./tmp/' + str(i) + '.png')
            i = i + 1

    def __draw_next_image(self, diffs):
        '''
        Draw pixel differences onto the current frame
        '''
        for pixel in diffs:
            color = ImageColor.getrgb(pixel["color"])
            self.current_frame.putpixel((pixel["x"],pixel["y"]), color) # or whatever color you wish

    def __make_gif(self):
        '''
        Gather up all our PNG images from the
        tmp directory and output a gif
        '''
        # Get list of frame PNGs
        file_list = glob.glob('./tmp/*.png')

        # Sort numerically
        list.sort(file_list, key=lambda x: int(x.split('.png')[0].split('/')[-1])) 

        clip = mpy.ImageSequenceClip(file_list, fps=self.config['INPUT_FPS'])
        clip = clip.speedx(factor=20)
        clip.write_gif('{}.gif'.format(self.output_name), fps=self.config['OUTPUT_FPS'])

    def __cleanup(self):
        '''
        Remove tmp directory with all frames
        '''

        print('Cleaning up...')

        shutil.rmtree('./tmp')

    def make(self):
        self.__load_frame_data()
        self.__create_image_frames()
        self.__make_gif()
        self.__cleanup()

        print('Done.')

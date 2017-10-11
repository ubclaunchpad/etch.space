from PIL import Image, ImageColor
import json, os
import glob
import moviepy.editor as mpy

BOARD_HEIGHT = 150
BOARD_WIDTH = 250
BG_COLOR = '#eaeaea'

def get_frame_data(path):
    frames = []
    with open(path, 'r') as input:
        line = input.readline()

        while line:
            j_dict = json.loads(line)
            frames.append(j_dict)
            line = input.readline()

    return frames

def get_next_frame(im, diffs):
    for pixel in diffs:
        color = ImageColor.getrgb(pixel["color"])
        im.putpixel((pixel["x"],pixel["y"]), color) # or whatever color you wish

def get_frames(data):

    board = Image.new('RGB', (BOARD_WIDTH, BOARD_HEIGHT), BG_COLOR) # create the Image of size 1 pixel 

    os.makedirs('./tmp')
    i = 0

    for frame in data:
        get_next_frame(board, frame)
        board.save('./tmp/' + str(i) + '.png')
        i = i + 1


get_frames(get_frame_data('./test'))

gif_name = 'WOW'
fps = 50
file_list = glob.glob('./tmp/*.png') # Get all the pngs in the current directory
list.sort(file_list, key=lambda x: int(x.split('.png')[0].split('/')[-1])) # Sort the images by #, this may need to be tweaked for your use case
clip = mpy.ImageSequenceClip(file_list, fps=fps)
clip.write_gif('{}.gif'.format(gif_name), fps=fps)
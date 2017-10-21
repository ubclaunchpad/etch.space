import sys
from GIF_maker import GIF_maker

if len(sys.argv) < 3:
    raise Exception('Requires 2 arguments: input_file output_name')

input_file = sys.argv[1]
output_name = sys.argv[2]

maker = GIF_maker(input_file, output_name)
maker.make()
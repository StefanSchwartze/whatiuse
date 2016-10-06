## compute_input.py

import sys, json, numpy as np, array, string 

#Read data from stdin
def get_data():
    lines = sys.stdin.readline().strip('"').split('/u')

    elements={}
    for line in string.split(lines[0], '\\n'):
      name,count=line.strip().split(',')
      elements.setdefault((name),[])
      elements[(name)].append( ( int(count) ) )
    #print elements

    browsers={}
    for line in string.split(lines[1], '\\n'):
      nameVersion,share=line.strip().split(',')
      browsers.setdefault((nameVersion),[])
      browsers[(nameVersion)].append((float(share)))
    #print browsers

    elements_to_browser={}
    for line in string.split(lines[2], '\\n'):
      el_name,browser_name=line.strip().split(',')
      elements_to_browser.setdefault((el_name),[])
      elements_to_browser[(el_name)].append((browser_name))
    #print elements_to_browser

    return elements, browsers, elements_to_browser

def main():
    #get our data as an array from get_data()
    elements, browsers, elements_to_browser = get_data()

    #return the sum to the output stream
    print browsers
    sys.stdout.flush()

#start process
if __name__ == '__main__':
    main()
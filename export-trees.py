import bpy
import os

workspace = os.path.dirname(os.path.abspath(__file__))
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=os.path.join(workspace, 'src', 'realistic_trees_collection.glb'))
for image in bpy.data.images:
    if image.source != 'FILE' or len(image.pixels) == 0:
        continue
    if image.packed_file:
        image.unpack(method='REMOVE')
    if max(image.size) > 512:
        factor = 512 / max(image.size)
        image.scale(max(1, round(image.size[0] * factor)), max(1, round(image.size[1] * factor)))
    folder = os.path.join(workspace, '.tools', 'tree-textures')
    os.makedirs(folder, exist_ok=True)
    image.filepath_raw = os.path.join(folder, image.name.replace('/', '_').replace('\\', '_') + '.png')
    image.file_format = 'PNG'
    image.save()

# Keep three different tree silhouettes and the collection's understory bush.
selected = ['EZTree0.Large', 'EZTree0.Medium011', 'EZTree1.Medium002', 'EZTree1.Bush006']
bpy.ops.object.select_all(action='DESELECT')
for obj in bpy.context.scene.objects:
    if any(name in obj.name for name in selected):
        obj.select_set(True)
        if obj.type == 'MESH':
            print('TREE_PART', obj.name, len(obj.data.vertices))
output = os.path.join(workspace, 'public', 'models', 'forest-trees')
os.makedirs(output, exist_ok=True)
bpy.ops.export_scene.gltf(filepath=os.path.join(output, 'trees.glb'), export_format='GLB', use_selection=True, export_yup=True, export_animations=False)
print('TREE_EXPORT_DONE')

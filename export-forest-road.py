import bpy
import os

workspace = os.path.dirname(os.path.abspath(__file__))
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=os.path.join(workspace, 'src', 'a_forest_3_with_a_road_at_night_for_game.glb'))
for image in bpy.data.images:
    if image.source != 'FILE' or len(image.pixels) == 0:
        continue
    if image.packed_file:
        image.unpack(method='REMOVE')
    if max(image.size) > 1024:
        factor = 1024 / max(image.size)
        image.scale(max(1, round(image.size[0] * factor)), max(1, round(image.size[1] * factor)))
    folder = os.path.join(workspace, '.tools', 'forest-road-textures')
    os.makedirs(folder, exist_ok=True)
    image.filepath_raw = os.path.join(folder, image.name.replace('/', '_').replace('\\', '_') + '.png')
    image.file_format = 'PNG'
    image.save()

groups = {}
for obj in list(bpy.context.scene.objects):
    if obj.type == 'MESH':
        material = obj.data.materials[0] if obj.data.materials else None
        groups.setdefault(material, []).append(obj)
for material, objects in groups.items():
    bpy.ops.object.select_all(action='DESELECT')
    for obj in objects:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = objects[0]
    bpy.ops.object.join()
    objects[0].name = 'ForestRoad_' + (material.name if material else 'ground')
    print('FOREST_BATCH', objects[0].name, len(objects), len(objects[0].data.vertices))

bpy.ops.object.select_all(action='DESELECT')
for obj in bpy.context.scene.objects:
    if obj.type == 'MESH':
        obj.select_set(True)
output = os.path.join(workspace, 'public', 'models', 'forest-road')
os.makedirs(output, exist_ok=True)
bpy.ops.export_scene.gltf(filepath=os.path.join(output, 'forest-road.glb'), export_format='GLB', use_selection=True, export_yup=True, export_animations=False)
print('FOREST_ROAD_EXPORT_DONE')
